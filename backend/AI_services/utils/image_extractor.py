"""
Image text extractor using OCR for gene analysis
Supports: JPEG, PNG, GIF, BMP, TIFF, WebP images
"""

import io
from typing import Optional
from PIL import Image
import pytesseract
import pdf2image

def extract_text_from_image(image_bytes: bytes, filename: str = "") -> str:
    """
    Extract text from image using OCR

    Args:
        image_bytes: Raw image bytes
        filename: Original filename (optional)

    Returns:
        Extracted text or empty string if extraction fails
    """

    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB if necessary (some formats need this)
        if image.mode not in ('L', 'RGB'):
            image = image.convert('RGB')

        # Extract text using pytesseract
        text = pytesseract.image_to_string(image)

        # Clean up the text
        text = text.strip()

        print(f"DEBUG: OCR extracted {len(text)} characters from image")

        return text

    except Exception as e:
        print(f"ERROR: Image OCR failed: {str(e)}")
        return ""