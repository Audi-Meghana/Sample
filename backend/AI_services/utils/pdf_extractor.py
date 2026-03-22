import fitz          # PyMuPDF
import pdfplumber
import io
import logging

logger = logging.getLogger(__name__)


def extract_text(uploaded_file) -> str:
    """
    Extract text from PDF using bytes-based approach.
    No temp files, no Poppler needed.
    """

    # ── Read bytes first ──────────────────────────────
    try:
        if hasattr(uploaded_file, "read"):
            file_bytes = uploaded_file.read()
        elif isinstance(uploaded_file, (bytes, bytearray)):
            file_bytes = bytes(uploaded_file)
        else:
            file_bytes = bytes(uploaded_file.read())
    except Exception as e:
        logger.error(f"❌ Failed to read file bytes: {e}")
        return ""

    if not file_bytes or len(file_bytes) < 100:
        logger.error(f"❌ File too small: {len(file_bytes) if file_bytes else 0} bytes")
        return ""

    logger.info(f"✅ File bytes received: {len(file_bytes)}")
    text = ""

    # ── Step 1: PyMuPDF from bytes (no temp file needed) ──
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
        doc.close()
        if text.strip():
            logger.info(f"✅ PyMuPDF extracted: {len(text)} chars")
            return text.strip()
    except Exception as e:
        logger.warning(f"PyMuPDF stream failed: {e}")

    # ── Step 2: pdfplumber from bytes ──────────────────
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        if text.strip():
            logger.info(f"✅ pdfplumber extracted: {len(text)} chars")
            return text.strip()
    except Exception as e:
        logger.warning(f"pdfplumber failed: {e}")

    # ── Step 3: PyMuPDF blocks from bytes ──────────────
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            for block in page.get_text("blocks"):
                if block[6] == 0:  # text block only
                    text += block[4] + "\n"
        doc.close()
        if text.strip():
            logger.info(f"✅ PyMuPDF blocks extracted: {len(text)} chars")
            return text.strip()
    except Exception as e:
        logger.warning(f"PyMuPDF blocks failed: {e}")

    logger.error("❌ All extraction methods failed — PDF may be corrupted or image-only")
    return ""