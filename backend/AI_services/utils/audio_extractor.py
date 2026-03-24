import os
import whisper
import tempfile
import cv2
import easyocr
import re
from moviepy import VideoFileClip
from fastapi import UploadFile

# ---------------------------------------------------
# ENVIRONMENT SETUP
# ---------------------------------------------------

# os.environ["PATH"] += os.pathsep + r"C:\ffmpeg-8.0.1-essentials_build\ffmpeg-8.0.1-essentials_build\bin"

# Load Whisper model once
model = whisper.load_model("base")

# Load EasyOCR once
reader = easyocr.Reader(['en'], gpu=False)


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

# ───────────────────────────────────────────────────
# GENE NAME MAP — Whisper mishears gene names
# Add any gene your doctors commonly dictate.
# Key   = what Whisper transcribes (lowercase)
# Value = correct HGNC gene symbol (uppercase)
# ───────────────────────────────────────────────────
GENE_NAME_MAP = {
    # L1CAM variants
    "l1 cam":       "L1CAM",
    "l 1 cam":      "L1CAM",
    "l1cam":        "L1CAM",
    "l one cam":    "L1CAM",
    "el one cam":   "L1CAM",
    "l1 c a m":     "L1CAM",

    # FGFR family
    "f g f r 3":    "FGFR3",
    "fgf r3":       "FGFR3",
    "fgf r 3":      "FGFR3",
    "f g f r 2":    "FGFR2",
    "fgf r2":       "FGFR2",
    "f g f r 1":    "FGFR1",

    # COL family
    "col 1 a 1":    "COL1A1",
    "col 1 a 2":    "COL1A2",
    "col 2 a 1":    "COL2A1",
    "col 4 a 1":    "COL4A1",
    "col 4 a 3":    "COL4A3",
    "col 12 a 1":   "COL12A1",
    "col twelve a one": "COL12A1",

    # PKD family
    "p k d 1":      "PKD1",
    "pkd one":      "PKD1",
    "p k d 2":      "PKD2",
    "pkd two":      "PKD2",
    "p k h d 1":    "PKHD1",

    # TSC family
    "t s c 1":      "TSC1",
    "tsc one":      "TSC1",
    "t s c 2":      "TSC2",
    "tsc two":      "TSC2",

    # NF family
    "n f 1":        "NF1",
    "nf one":       "NF1",
    "n f 2":        "NF2",
    "nf two":       "NF2",

    # BRCA family
    "b r c a 1":    "BRCA1",
    "brca one":     "BRCA1",
    "b r c a 2":    "BRCA2",
    "brca two":     "BRCA2",

    # CFTR
    "c f t r":      "CFTR",
    "cystic fibrosis transmembrane": "CFTR",

    # SMAD family
    "s m a d 4":    "SMAD4",
    "smad four":    "SMAD4",
    "s m a d 2":    "SMAD2",

    # Common single genes
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
    """
    Replace Whisper's misheared gene names with correct HGNC symbols.
    Case-insensitive match, whole-word aware.
    Longer phrases are matched first to avoid partial replacements.
    """
    # Sort by length descending so longer patterns match first
    sorted_map = sorted(GENE_NAME_MAP.items(), key=lambda x: len(x[0]), reverse=True)
    for wrong, correct in sorted_map:
        # Use word-boundary aware replacement (case-insensitive)
        pattern = r'(?<![A-Za-z0-9])' + re.escape(wrong) + r'(?![A-Za-z0-9])'
        text = re.sub(pattern, correct, text, flags=re.IGNORECASE)
    return text


def convert_spoken_numbers(text):
    for word, digit in NUMBER_MAP.items():
        text = re.sub(rf"\b{word}\b", digit, text, flags=re.IGNORECASE)
    return text


def merge_spaced_letters(text):
    # Join patterns like F G F R 3
    text = re.sub(
        r"\b(?:[A-Z]\s+){2,}[A-Z0-9]\b",
        lambda m: m.group(0).replace(" ", ""),
        text
    )
    return text


def fix_or_to_r(text):
    # Fix patterns like "FGF or 3" → "FGFR3"
    text = re.sub(
        r"\b([A-Z]{2,})\s+or\s+(\d)\b",
        r"\1R\2",
        text,
        flags=re.IGNORECASE
    )
    return text


def fix_gene_phrase(text):
    # Convert "G name" → "gene name"
    text = re.sub(r"\bG name\b", "gene name", text, flags=re.IGNORECASE)
    # Convert "my G name" → "my gene name"
    text = re.sub(r"\bmy G\b", "my gene", text, flags=re.IGNORECASE)
    return text


def fix_variant_format(text):
    # Convert "C dot 1234A greater than G" → "c.1234A>G"
    text = re.sub(
        r"C dot (\d+)([A-Z]) greater than ([A-Z])",
        r"c.\1\2>\3",
        text,
        flags=re.IGNORECASE
    )
    # Also handle: "C.1234 greater than G" → "c.1234>G"
    text = re.sub(
        r"\b[Cc]\.(\d+)([A-Za-z]?)\s+greater than\s+([A-Za-z])\b",
        lambda m: f"c.{m.group(1)}{m.group(2)}>{m.group(3).upper()}",
        text
    )
    return text


def normalize_gene_text(text: str) -> str:
    """
    Full normalization pipeline for Whisper transcription output.
    Order matters — gene name fix runs first and last to catch all cases.
    """
    text = fix_gene_phrase(text)        # "G name" → "gene name"
    text = fix_gene_names(text)         # "L1 cam" → "L1CAM"  ← NEW
    text = convert_spoken_numbers(text) # "one" → "1"
    text = merge_spaced_letters(text)   # "F G F R 3" → "FGFR3"
    text = fix_or_to_r(text)            # "FGF or 3" → "FGFR3"
    text = fix_variant_format(text)     # "C dot 1234A greater than G" → "c.1234A>G"
    text = fix_gene_names(text)         # run again — catches any newly merged tokens
    return text


# ===================================================
# AUDIO → Whisper
# ===================================================

def extract_audio_text(uploaded_file: UploadFile) -> str:
    """
    Accept a FastAPI UploadFile (audio).
    Writes to a temp file → Whisper transcription → gene normalization.
    Returns clean transcribed text, or "" on failure.
    """
    extension = os.path.splitext(uploaded_file.filename)[1] or ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp:
        tmp.write(uploaded_file.file.read())
        temp_audio_path = tmp.name

    try:
        print("🎤 Transcribing:", temp_audio_path)

        result   = model.transcribe(temp_audio_path)
        raw_text = result["text"].strip()

        print("🎤 Raw Result:", raw_text)

        clean_text = normalize_gene_text(raw_text)

        print("🎤 Normalized Result:", clean_text)

        return clean_text

    except Exception as e:
        print("❌ Transcription error:", str(e))
        return ""

    finally:
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)


# ===================================================
# VIDEO → Audio → Whisper  /  No audio → EasyOCR
# ===================================================

def extract_video_text(file_bytes: bytes) -> str:
    """
    Accepts raw bytes (caller does: contents = await file.read()).

    Flow:
      1. Save bytes to temp .mp4
      2. If video has audio  → Whisper transcription
      3. If no audio / empty → EasyOCR on sampled frames (every 30th frame)
      4. Gene-normalize the result and return
    """

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(file_bytes)
        temp_video_path = tmp.name

    temp_audio_path = temp_video_path + ".mp3"

    extracted_text = ""
    seen_lines     = set()

    try:
        print("🎬 Opening video:", temp_video_path)
        video = VideoFileClip(temp_video_path)

        # ── STEP 1: Whisper from audio track ─────────────────────────────
        if video.audio is not None:
            print("🎬 Audio track found — extracting...")
            video.audio.write_audiofile(temp_audio_path, logger=None)

            result         = model.transcribe(temp_audio_path)
            extracted_text = result["text"].strip()

            print("🎬 Whisper result:", extracted_text)
        else:
            print("🎬 No audio track found — will run OCR")

        video.close()

        # ── STEP 2: EasyOCR fallback (no audio OR Whisper returned empty) ─
        if not extracted_text.strip():
            print("🔍 Running OCR on video frames...")

            cap         = cv2.VideoCapture(temp_video_path)
            frame_count = 0

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                # Sample every 30th frame (~1 fps for 30fps video)
                if frame_count % 30 == 0:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    gray = cv2.GaussianBlur(gray, (5, 5), 0)
                    gray = cv2.resize(
                        gray, None, fx=2, fy=2,
                        interpolation=cv2.INTER_CUBIC
                    )

                    results = reader.readtext(gray)

                    for (bbox, text, prob) in results:
                        clean_line = text.strip()
                        # Use ". " separator so AI can parse sentences
                        if prob > 0.6 and len(clean_line) > 2:
                            if clean_line not in seen_lines:
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

    # ── Final cleaning ────────────────────────────────────────────────────
    clean_text = extracted_text.replace("\n", " ")
    clean_text = " ".join(clean_text.split())

    # Full gene normalization (works for both Whisper and OCR output)
    clean_text = normalize_gene_text(clean_text)

    print("🧹 Final extracted text:", clean_text[:300], "..." if len(clean_text) > 300 else "")
    return clean_text