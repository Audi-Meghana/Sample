from fastapi import APIRouter, UploadFile
from app.services.speech_to_text import transcribe_audio
from app.services.clinical_parser import parse_clinical_text
from app.services.copilot_analysis import analyze_case

router = APIRouter(prefix="/dictation")

@router.post("/voice")
async def analyze_voice(file: UploadFile):
    audio_bytes = await file.read()
    transcript = transcribe_audio(audio_bytes)
    parsed = parse_clinical_text(transcript)
    analysis = analyze_case(parsed)
    return {
        "transcript": transcript,
        "parsed": parsed,
        "analysis": analysis
    }