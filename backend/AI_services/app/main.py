from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any
from app.engines.clinical_ai_core import ClinicalAICore
from utils.pdf_extractor import extract_text
from utils.audio_extractor import extract_audio_text, extract_video_text
from utils.document_extractor import extract_text_from_document
import joblib
from app.engines.ai_service import ClinicalAIService
from app.engines.clinical_risk_engine import calculate_clinical_risk_score

import re
app = FastAPI(title="Prenatal AI Copilot")

model_data = joblib.load("clinical_ai_model.pkl")

ai = ClinicalAIService(
    kb_data=model_data["kb_data"],
    clinvar_df=model_data["clinvar_df"]
)

from app.routes.dictation import router
app.include_router(router)


# =========================
# MEDICAL KEYWORD CHECKER
# =========================

MEDICAL_KEYWORDS = [
    # Report types
    "gene", "genetic", "variant", "mutation", "exome", "sequencing",
    "dna", "report", "analysis", "prenatal",
    # Scan related
    "scan", "ultrasound", "fetal", "biometry", "trimester",
    "anomaly", "anatomy", "doppler", "amniotic",
    # Serum related
    "serum", "screen", "chromosom", "biochemical",
    # Gene name pattern — e.g. "L1CAM", "FGFR3"
    # (checked separately below)
]
def dynamic_normalize(text: str) -> str:
    def fix(match):
        return re.sub(r'\s+', '', match.group()).upper()
    return re.sub(r'\b(?:[A-Za-z]\s+){2,}[A-Za-z0-9]\b', fix, text)

def _is_medical_speech(text: str) -> bool:
    """
    Returns True if the transcribed text contains recognizable
    medical / report-related content with sufficient context.
    Returns False if it looks like unrelated/gibberish speech.
    """
    t = text.lower()

    # 1️⃣ Check for gene-like tokens (e.g. "L1CAM", "FGFR3", "COL4A1")
    import re
    gene_like = re.findall(r'\b[A-Z]{1,4}\d+[A-Z]*\b', text)  # Require uppercase for genes
    if gene_like:
        return True

    # 2️⃣ Check for specific medical report keywords with context
    report_keywords = ["report", "analysis", "sequencing", "scan", "ultrasound", "serum", "screen"]
    medical_terms = ["gene", "variant", "mutation", "fetal", "prenatal", "chromosome"]

    has_report = any(k in t for k in report_keywords)
    has_medical = any(k in t for k in medical_terms)

    # Require at least a report keyword OR multiple medical terms
    if has_report:
        return True
    if t.count("gene") >= 2 or (has_medical and len(text.split()) > 10):
        return True

    return False


# =========================
# MODELS
# =========================

class ChecklistRequest(BaseModel):
    gene: str = Field(..., description="Gene symbol is required")


class SelectionsModel(BaseModel):
    core:       Dict[str, str] = Field(default_factory=dict)
    supportive: Dict[str, str] = Field(default_factory=dict)
    negative:   Dict[str, str] = Field(default_factory=dict)


class PP4Request(BaseModel):
    gene:       str
    gestation:  int
    selections: SelectionsModel


class TextInputRequest(BaseModel):
    text:      str
    gestation: int | None = None


class RiskScoreRequest(BaseModel):
    report_type:    str
    extracted_data: Dict[str, Any] = Field(default_factory=dict)


# =========================
# 1️⃣ PDF Upload
# =========================

@app.post("/extract-pdf")
async def extract_pdf(
    file: UploadFile = File(...),
    gestation: int | None = None
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    text = extract_text(file.file)

    print(f"DEBUG extracted text length: {len(text) if text else 0}")
    print(f"DEBUG text preview: {text[:200] if text else 'EMPTY'}")

    if not text or len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="PDF is empty or unreadable. Please ensure the PDF contains readable text.")

    result = ai.extract_structured(text, gestation, source="pdf")

    print(f"DEBUG extract_structured result: {result}")

    if result is None:
        return {
            "report_type": "UNKNOWN",
            "error": "Extraction returned None",
            "genetic": {
                "gene":       "UNKNOWN",
                "variant":    None,
                "confidence": 0.0,
                "status":     "error"
            },
            "suggested_phenotypes": [],
            "checklist": []
        }

    return result


# =========================
# 2️⃣ Audio Upload
# =========================

@app.post("/extract-audio")
async def extract_audio(
    file: UploadFile = File(...),
    gestation: int | None = None
):
    if not (
        file.content_type.startswith("audio") or
        file.filename.lower().endswith((".webm", ".mp3", ".wav"))
    ):
        raise HTTPException(status_code=400, detail="Unsupported audio format.")

    text = extract_audio_text(file)

    print(f"[extract-audio] Transcribed text: {text}")

    # ── EMPTY transcription ───────────────────────────────────────────────
    if not text or len(text.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Audio transcription returned empty. Please speak clearly and try again."
        )

    # ── UNRECOGNIZED / UNRELATED SPEECH ──────────────────────────────────
    # If Whisper transcribed something but it has zero medical content,
    # return a clear warning instead of silently defaulting to SCAN.
    if not _is_medical_speech(text):
        print(f"[extract-audio] Unrecognized speech detected: '{text[:100]}'")
        return {
            "warning":           "unrecognized_speech",
            "report_type":       None,
            "raw_transcription": text,
            "message": (
                "Audio did not contain recognizable medical report content. "
                "Please speak clearly and mention the report type and gene name. "
                "For example: 'Gene report, gene name is L1CAM' or "
                "'Ultrasound scan, fetal biometry normal'."
            )
        }

    # ── NORMAL FLOW ───────────────────────────────────────────────────────
    return ai.extract_structured(text, gestation, source="audio")


# =========================
# 3️⃣ Video Upload
# =========================

@app.post("/extract-video")
async def extract_video(
    file: UploadFile = File(...),
    gestation: int | None = None
):
    if not file.filename.lower().endswith((".mp4", ".mov", ".avi")):
        raise HTTPException(status_code=400, detail="Unsupported video format.")

    contents = await file.read()
    text = extract_video_text(contents)

    print(f"[extract-video] Extracted text: {text[:200] if text else 'EMPTY'}")

    if not text or len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Video transcription failed.")

    # ── UNRECOGNIZED SPEECH (video with audio) ────────────────────────────
    if not _is_medical_speech(text):
        print(f"[extract-video] Unrecognized speech detected: '{text[:100]}'")
        return {
            "warning":           "unrecognized_speech",
            "report_type":       None,
            "raw_transcription": text,
            "message": (
                "Video did not contain recognizable medical report content. "
                "Please ensure the video contains a medical report reading."
            )
        }

    return ai.extract_structured(text, gestation, source="video")


# =========================
# 4️⃣ Direct Text Input
# =========================

@app.post("/extract-text")
async def extract_text_input(request: TextInputRequest):
    text = request.text or ""
    if len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text too short.")

    # For voice/text content that is not medical, return explicit warning
    if not _is_medical_speech(text):
        return {
            "warning": "unrecognized_speech",
            "report_type": None,
            "raw_text": text,
            "message": (
                "Text input does not appear to contain medical gene/variant content. "
                "Please provide a valid prenatal genetic report or gene finding."
            ),
            "genetic": {
                "gene": "UNKNOWN",
                "variant": None,
                "confidence": 0.0,
                "status": "unrecognized"
            },
            "checklist": [],
            "suggested_phenotypes": []
        }

    return ai.extract_structured(text, request.gestation, source="text")


# =========================
# 5️⃣ Generate Checklist
# =========================

@app.post("/generate-checklist")
async def generate_checklist(request: ChecklistRequest):

    if not request.gene or request.gene in (
        "NOT_APPLICABLE", "UNKNOWN", "QUOTA_EXHAUSTED", ""
    ):
        return {
            "metadata": {},
            "checklist": {
                "core_prenatal_findings":  [],
                "supportive_findings":     [],
                "fetal_echo_findings":     [],
                "negative_predictors":     []
            },
            "message": "Checklist not applicable for this report type"
        }

    return ai.generate_checklist(request.gene)


# =========================
# 6️⃣ Calculate PP4 (WES)
# =========================

@app.post("/calculate-pp4")
async def calculate_pp4(request: PP4Request):

    pp4_result = ai.calculate_pp4(
        gene=request.gene,
        gestation=request.gestation,
        selections=request.selections.dict()
    )

    summaries = ai.generate_summaries(request.gene, pp4_result)

    return {
        "pp4_result": pp4_result,
        "summaries":  summaries
    }


# =========================
# 7️⃣ Calculate Clinical Risk Score (CMA/SCAN/SERUM)
# =========================

@app.post("/calculate-risk-score")
async def calculate_risk_score(request: RiskScoreRequest):
    """
    Calculate Clinical Risk Score for non-WES reports.
    Returns PP4-compatible structure for frontend consistency.
    """
    try:
        print(f"[FastAPI] /calculate-risk-score received: report_type={request.report_type}")
        print(f"[FastAPI] extracted_data keys: {list(request.extracted_data.keys())}")
        print(f"[FastAPI] extracted_data: {request.extracted_data}")

        score_result = calculate_clinical_risk_score(
            report_type=request.report_type,
            extracted=request.extracted_data
        )

        print(f"[FastAPI] Risk score calculated: {score_result['final_score']}")

        return {
            "pp4_result": {
                "raw_score":       score_result["raw_score"],
                "final_score":     score_result["final_score"],
                "multiplier":      score_result["multiplier"],
                "state":           score_result["state"],
                "score_type":      score_result["score_type"],
                "report_type":     score_result["report_type"],
                "risk_color":      score_result["risk_color"],
                "scoring_factors": score_result["scoring_factors"],
            },
            "summaries": {
                "doctor_summary":  score_result["doctor_summary"],
                "patient_summary": score_result["patient_summary"],
                "risk_level":      score_result["risk_level"]
            }
        }

    except Exception as e:
        print(f"[FastAPI] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Risk score calculation failed: {str(e)}")


# =========================
# 8️⃣ Document Upload (DOCX, TXT, etc.)
# =========================

@app.post("/extract-document")
async def extract_document(
    file: UploadFile = File(...),
    gestation: int | None = None
):
    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(status_code=400, detail="File is empty.")

        text = extract_text_from_document(file_bytes, file.filename)

        if not text or len(text.strip()) < 20:
            raise HTTPException(
                status_code=400,
                detail="Document is empty or unreadable. Please check file format."
            )

        print(f"DEBUG extracted document text length: {len(text)}")
        print(f"DEBUG text preview: {text[:200]}")

        result = ai.extract_structured(text, gestation, source="document")

        return result if result else {
            "report_type": "UNKNOWN",
            "error": "Extraction returned None",
            "genetic": {
                "gene":       "UNKNOWN",
                "variant":    None,
                "confidence": 0.0,
                "status":     "error"
            },
            "suggested_phenotypes": [],
            "checklist": []
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document extraction failed: {str(e)}")


# =========================
# 9️⃣ Text File Upload (.txt)
# =========================

@app.post("/extract-text-file")
async def extract_text_file(
    file: UploadFile = File(...),
    gestation: int | None = None
):
    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(status_code=400, detail="File is empty.")

        try:
            text = file_bytes.decode('utf-8', errors='replace').strip()
        except:
            text = file_bytes.decode('latin-1', errors='replace').strip()

        if not text or len(text.strip()) < 20:
            raise HTTPException(status_code=400, detail="Text file is empty or too short.")

        print(f"DEBUG extracted text length: {len(text)}")

        result = ai.extract_structured(text, gestation, source="text")

        return result if result else {
            "report_type": "UNKNOWN",
            "genetic": {
                "gene":       "UNKNOWN",
                "variant":    None,
                "confidence": 0.0,
                "status":     "error"
            },
            "suggested_phenotypes": [],
            "checklist": []
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text file extraction failed: {str(e)}")








# =========================
# 🔟 Spreadsheet Upload (XLSX, XLS, CSV)
# =========================

@app.post("/extract-spreadsheet")
async def extract_spreadsheet(
    file: UploadFile = File(...),
    gestation: int | None = None
):
    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(status_code=400, detail="File is empty.")

        text = extract_text_from_document(file_bytes, file.filename)

        if not text or len(text.strip()) < 20:
            raise HTTPException(status_code=400, detail="Spreadsheet is empty or unreadable.")

        print(f"DEBUG extracted spreadsheet text length: {len(text)}")

        result = ai.extract_structured(text, gestation, source="document")

        return result if result else {
            "report_type": "UNKNOWN",
            "genetic": {
                "gene":       "UNKNOWN",
                "variant":    None,
                "confidence": 0.0,
                "status":     "error"
            },
            "suggested_phenotypes": [],
            "checklist": []
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Spreadsheet extraction failed: {str(e)}")