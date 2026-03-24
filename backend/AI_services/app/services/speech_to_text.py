import whisper
import tempfile

model = whisper.load_model("base")

def transcribe_audio(file_bytes):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp:
        temp.write(file_bytes)
        temp_path = temp.name
    result = model.transcribe(temp_path)
    return result["text"]