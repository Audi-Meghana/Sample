import os
import tempfile

IS_RENDER = os.getenv("RENDER", "false").lower() == "true"

if not IS_RENDER:
    import whisper
    _model = whisper.load_model("base")
else:
    from groq import Groq
    _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def transcribe_audio(file_bytes):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp:
        temp.write(file_bytes)
        temp_path = temp.name

    try:
        if IS_RENDER:
            with open(temp_path, "rb") as audio_file:
                transcription = _groq_client.audio.transcriptions.create(
                    model=os.getenv("GROQ_WHISPER_MODEL", "whisper-large-v3"),
                    file=audio_file,
                    response_format="text"
                )
            return transcription if isinstance(transcription, str) else transcription.text
        else:
            result = _model.transcribe(temp_path)
            return result["text"]

    except Exception as e:
        print(f"[speech_to_text] Transcription error: {e}")
        return ""

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)