import os
import tempfile
import re
from fastapi import UploadFile

# ---------------------------------------------------
# ENVIRONMENT SETUP
# ---------------------------------------------------

IS_RENDER = os.getenv("RENDER", "false").lower() == "true"

# Load heavy libraries only when running locally
if not IS_RENDER:
    import whisper
    import cv2
    import easyocr
    from moviepy import VideoFileClip

    # Load Whisper model once (local only)
    _whisper_model = whisper.load_model("base")

    # Load EasyOCR once (local only)
    _ocr_reader = easyocr.Reader(['en'], gpu=False)
else:
    from groq import Groq
    _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ===================================================
# TEXT NORMALIZATION (GENE SAFE – DYNAMIC)
# ===================================================

NUMBER_MAP = {
    "zero": "0",
    "one":  "1",
    "two":  "2",
    "three":"3",
    "four": "4",
    "five": "5",
    "six":  "6",
    "seven":"7",
    "eight":"8",
    "nine": "9",
    "ten":  "10"
}

GENE_NAME_MAP = {
    "l1 cam":       "L1CAM",
    "l 1 cam":      "L1CAM",
    "l1cam":        "L1CAM",
    "l one cam":    "L1CAM",
    "el one cam":   "L1CAM",
    "l1 c a m":     "L1CAM",
    "f g f r 3":    "FGFR3",
    "fgf r3":       "FGFR3",
    "fgf r 3":      "FGFR3",
    "f g f r 2":    "FGFR2",
    "fgf r2":       "FGFR2",
    "f g f r 1":    "FGFR1",
    "col 1 a 1":    "COL1A1",
    "col 1 a 2":    "COL1A2",
    "col 2 a 1":    "COL2A1",
    "col 4 a 1":    "COL4A1",
    "col 4 a 3":    "COL4A3",
    "col 12 a 1":   "COL12A1",
    "col twelve a one": "COL12A1",
    "p k d 1":      "PKD1",
    "pkd one":      "PKD1",
    "p k d 2":      "PKD2",
    "pkd two":      "PKD2",
    "p k h d 1":    "PKHD1",
    "t s c 1":      "TSC1",
    "tsc one":      "TSC1",
    "t s c 2":      "TSC2",
    "tsc two":      "TSC2",
    "n f 1":        "NF1",
    "nf one":       "NF1",
    "n f 2":        "NF2",
    "nf two":       "NF2",
    "b r c a 1":    "BRCA1",
    "brca one":     "BRCA1",
    "b r c a 2":    "BRCA2",
    "brca two":     "BRCA2",
    "c f t r":      "CFTR",
    "cystic fibrosis transmembrane": "CFTR",
    "s m a d 4":    "SMAD4",
    "smad four":    "SMAD4",
    "s m a d 2":    "SMAD2",
    "v h l":        "VHL",
    "a p c":        "APC",
    "r e t":        "RET",
    "m e n 1":      "MEN1",
    "men one":      "MEN1",
    "p t e n":      "PTEN",
    "r b 1":        "RB1",
    "w t 1":        "WT1",
    "p 5 3":        "TP53",
    "t p 5 3":      "TP53",
    "mlh one":      "MLH1",
    "m l h 1":      "MLH1",
    "msh two":      "MSH2",
    "m s h 2":      "MSH2",
    "c h d 7":      "CHD7",
    "chd seven":    "CHD7",
    "s o x 9":      "SOX9",
    "f b n 1":      "FBN1",
    "fbn one":      "FBN1",
    "r y r 1":      "RYR1",
    "d m d":        "DMD",
}


def fix_gene_names(text: str) -> str:
    sorted_map = sorted(GENE_NAME_MAP.items(), key=lambda x: len(x[0]), reverse=True)
    for wrong, correct in sorted_map:
        pattern = r'(?<![A-Za-z0-9])' + re.escape(wrong) + r'(?![A-Za-z0-9])'
        text = re.sub(pattern, correct, text, flags=re.IGNORECASE)
    return text


def convert_spoken_numbers(text):
    for word, digit in NUMBER_MAP.items():
        text = re.sub(rf"\b{word}\b", digit, text, flags=re.IGNORECASE)
    return text


def merge_spaced_letters(text):
    text = re.sub(
        r"\b(?:[A-Z]\s+){2,}[A-Z0-9]\b",
        lambda m: m.group(0).replace(" ", ""),
        text
    )
    return text


def fix_or_to_r(text):
    text = re.sub(
        r"\b([A-Z]{2,})\s+or\s+(\d)\b",
        r"\1R\2",
        text,
        flags=re.IGNORECASE
    )
    return text


def fix_gene_phrase(text):
    text = re.sub(r"\bG name\b", "gene name", text, flags=re.IGNORECASE)
    text = re.sub(r"\bmy G\b", "my gene", text, flags=re.IGNORECASE)
    return text


def fix_variant_format(text):
    text = re.sub(
        r"C dot (\d+)([A-Z]) greater than ([A-Z])",
        r"c.\1\2>\3",
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(
        r"\b[Cc]\.(\d+)([A-Za-z]?)\s+greater than\s+([A-Za-z])\b",
        lambda m: f"c.{m.group(1)}{m.group(2)}>{m.group(3).upper()}",
        text
    )
    return text


def normalize_gene_text(text: str) -> str:
    text = fix_gene_phrase(text)
    text = fix_gene_names(text)
    text = convert_spoken_numbers(text)
    text = merge_spaced_letters(text)
    text = fix_or_to_r(text)
    text = fix_variant_format(text)
    text = fix_gene_names(text)
    return text


# ===================================================
# TRANSCRIPTION — Groq (Render) or Whisper (Local)
# ===================================================

def _transcribe_audio_file(audio_path: str) -> str:
    """
    Transcribe audio file using:
    - Groq Whisper API  → on Render (cloud, no RAM needed)
    - Local Whisper     → on local machine
    """
    if IS_RENDER:
        print("☁️ Using Groq Whisper API...")
        with open(audio_path, "rb") as audio_file:
            transcription = _groq_client.audio.transcriptions.create(
                model="whisper-large-v3",
                file=audio_file,
                response_format="text"
            )
        # Groq returns a string directly when response_format="text"
        return transcription.strip() if isinstance(transcription, str) else transcription.text.strip()
    else:
        print("🖥️ Using local Whisper model...")
        result = _whisper_model.transcribe(audio_path)
        return result["text"].strip()


# ===================================================
# AUDIO → Transcription
# ===================================================

def extract_audio_text(uploaded_file: UploadFile) -> str:
    """
    Accept a FastAPI UploadFile (audio).
    Writes to a temp file → transcription → gene normalization.
    Returns clean transcribed text, or "" on failure.
    """
    extension = os.path.splitext(uploaded_file.filename)[1] or ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp:
        tmp.write(uploaded_file.file.read())
        temp_audio_path = tmp.name

    try:
        print("🎤 Transcribing:", temp_audio_path)

        raw_text   = _transcribe_audio_file(temp_audio_path)
        clean_text = normalize_gene_text(raw_text)

        print("🎤 Raw Result:", raw_text)
        print("🎤 Normalized Result:", clean_text)

        return clean_text

    except Exception as e:
        print("❌ Transcription error:", str(e))
        return ""

    finally:
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)


# ===================================================
# VIDEO → Audio → Transcription / No audio → OCR
# ===================================================

def extract_video_text(file_bytes: bytes) -> str:
    """
    On Render  → audio track extracted → Groq Whisper (no OCR fallback, no easyocr)
    On Local   → audio track → local Whisper, no audio → EasyOCR on frames
    """

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(file_bytes)
        temp_video_path = tmp.name

    temp_audio_path = temp_video_path + ".mp3"
    extracted_text  = ""

    try:
        print("🎬 Opening video:", temp_video_path)

        if IS_RENDER:
            # ── RENDER: Use ffmpeg directly to extract audio ──────────────
            import subprocess
            subprocess.run(
                ["ffmpeg", "-i", temp_video_path, "-q:a", "0", "-map", "a", temp_audio_path, "-y"],
                capture_output=True
            )

            if os.path.exists(temp_audio_path) and os.path.getsize(temp_audio_path) > 0:
                print("🎬 Audio extracted — sending to Groq Whisper...")
                extracted_text = _transcribe_audio_file(temp_audio_path)
            else:
                print("🎬 No audio track found in video — OCR not available on Render")
                extracted_text = ""

        else:
            # ── LOCAL: Use moviepy + Whisper + EasyOCR fallback ──────────
            video = VideoFileClip(temp_video_path)

            if video.audio is not None:
                print("🎬 Audio track found — extracting...")
                video.audio.write_audiofile(temp_audio_path, logger=None)
                extracted_text = _transcribe_audio_file(temp_audio_path)
                print("🎬 Whisper result:", extracted_text)
            else:
                print("🎬 No audio track — running EasyOCR on frames...")

            video.close()

            # EasyOCR fallback (local only)
            if not extracted_text.strip():
                seen_lines  = set()
                cap         = cv2.VideoCapture(temp_video_path)
                frame_count = 0

                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        break

                    if frame_count % 30 == 0:
                        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                        gray = cv2.GaussianBlur(gray, (5, 5), 0)
                        gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

                        results = _ocr_reader.readtext(gray)
                        for (bbox, text, prob) in results:
                            clean_line = text.strip()
                            if prob > 0.6 and len(clean_line) > 2 and clean_line not in seen_lines:
                                seen_lines.add(clean_line)
                                extracted_text += ". " + clean_line

                    frame_count += 1

                cap.release()
                print(f"🔍 OCR done — {len(seen_lines)} unique lines from {frame_count} frames")

    except Exception as e:
        print("❌ Video processing error:", str(e))
        import traceback
        traceback.print_exc()

    finally:
        for path in (temp_audio_path, temp_video_path):
            if os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass

    clean_text = extracted_text.replace("\n", " ")
    clean_text = " ".join(clean_text.split())
    clean_text = normalize_gene_text(clean_text)

    print("🧹 Final extracted text:", clean_text[:300], "..." if len(clean_text) > 300 else "")
    return clean_text