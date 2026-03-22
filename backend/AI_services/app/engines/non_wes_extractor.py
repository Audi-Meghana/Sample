import os
import json
import re
import requests
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


class NonWESExtractor:
    """
    Extracts structured data from CMA, SCAN, SERUM reports
    using the same Groq already in your project.
    """

    def __init__(self):
        self.api_key  = os.getenv("GROQ_API_KEY")
        self.model    = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    def _call_groq(self, prompt: str) -> dict:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        body = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "max_tokens": 1000
        }
        resp = requests.post(GROQ_URL, headers=headers, json=body, timeout=30)
        resp.raise_for_status()
        raw = resp.json()["choices"][0]["message"]["content"].strip()
        cleaned = re.sub(r"```(?:json)?\s*", "", raw).replace("```", "").strip()
        return json.loads(cleaned)

    # ─────────────────────────────────────────
    # CMA
    # ─────────────────────────────────────────
    def extract_cma(self, text: str) -> dict:
        prompt = f"""
Extract structured data from this Chromosomal Microarray (CMA) report.
Return ONLY raw JSON, no markdown, no explanation:
{{
  "report_type": "CMA",
  "cnv_result": "Normal or Abnormal",
  "aneuploidy": {{
    "trisomy_21": "Negative or Positive",
    "trisomy_18": "Negative or Positive",
    "trisomy_13": "Negative or Positive",
    "sex_chromosome": "Negative or Positive"
  }},
  "microdeletions": "Negative or list positives",
  "roh": "None or description",
  "consanguinity": "Yes or No or Unknown",
  "cardiac_findings": "list cardiac findings or None",
  "mcc": "Negative or Positive",
  "result_summary": "one line summary"
}}
Report:
{text[:5000]}
"""
        try:
            result = self._call_groq(prompt)
            result["status"] = "ok"
            return result
        except Exception as e:
            logger.error(f"CMA extraction failed: {e}")
            return {
                "report_type": "CMA",
                "status": "error",
                "cnv_result": "Unknown",
                "result_summary": "Extraction failed"
            }

    # ─────────────────────────────────────────
    # SCAN
    # ─────────────────────────────────────────
    def extract_scan(self, text: str) -> dict:
        prompt = f"""
Extract structured data from this prenatal ultrasound scan report.
Return ONLY raw JSON, no markdown, no explanation:
{{
  "report_type": "SCAN",
  "scan_type": "First Trimester or Second Trimester or Third Trimester",
  "gestational_age": "e.g. 12W 3D or null",
  "edd": "date or null",
  "fhr": "bpm number or null",
  "biometry": {{
    "bpd": "mm or null",
    "hc":  "mm or null",
    "ac":  "mm or null",
    "fl":  "mm or null",
    "crl": "mm or null",
    "efw": "grams or null"
  }},
  "anomalies": ["list ALL anomalies found or empty array if none"],
  "nt": "mm or null",
  "nasal_bone": "Present or Absent or Hypoplastic or null",
  "placenta": "Anterior or Posterior or null",
  "liquor": "Normal or Reduced or Increased or null",
  "doppler": "Normal or description or null",
  "cervical_length": "mm or null",
  "impression": "main clinical impression",
  "result_summary": "one line summary"
}}
Report:
{text[:5000]}
"""
        try:
            result = self._call_groq(prompt)
            result["status"] = "ok"
            return result
        except Exception as e:
            logger.error(f"SCAN extraction failed: {e}")
            return {
                "report_type": "SCAN",
                "status": "error",
                "impression": "Unknown",
                "result_summary": "Extraction failed"
            }

    # ─────────────────────────────────────────
    # SERUM
    # ─────────────────────────────────────────
    def extract_serum(self, text: str) -> dict:
        prompt = f"""
Extract structured data from this maternal serum screening form or report.
Return ONLY raw JSON, no markdown, no explanation:
{{
  "report_type": "SERUM",
  "patient_name": "name or null",
  "screen_type": "Screen 2 or Screen 3 or Screen 4 or null",
  "gestational_age": "weeks and days or null",
  "lmp": "date or null",
  "nt": "mm value or null",
  "nt_result": "Normal or Abnormal or null",
  "nasal_bone": "Present or Absent or null",
  "ductus_venosus": "Normal or Abnormal or null",
  "tricuspid": "Present or Absent or null",
  "ivf": "Yes or No or null",
  "diabetic": "Yes or No or null",
  "risk_factors": ["list any risk factors or history notes"],
  "result_summary": "one line summary"
}}
Report:
{text[:5000]}
"""
        try:
            result = self._call_groq(prompt)
            result["status"] = "ok"
            return result
        except Exception as e:
            logger.error(f"SERUM extraction failed: {e}")
            return {
                "report_type": "SERUM",
                "status": "error",
                "result_summary": "Extraction failed"
            }