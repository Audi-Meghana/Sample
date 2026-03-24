"""
LLM-Based Clinical Risk Scorer
Uses Groq LLM to analyze clinical findings and generate risk scores
with intelligent reasoning. Falls back to rule engine if LLM unavailable.
"""

import json
import logging
import os
import re

logger = logging.getLogger(__name__)

# Initialize Groq client (optional - will fall back to rule engine if unavailable)
client = None
try:
    from groq import Groq
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if GROQ_API_KEY:
        client = Groq(api_key=GROQ_API_KEY)
        logger.info("[LLM] Groq client initialized successfully")
    else:
        logger.info("[LLM] GROQ_API_KEY not set - will use rule engine")
except ImportError:
    logger.warning("[LLM] groq package not installed. Run: pip install groq")
except Exception as e:
    logger.warning(f"[LLM] Groq init failed: {e} - will use rule engine fallback")


def _build_prompt(report_type: str, extracted: dict) -> str:
    """
    Build a natural language prompt from extracted clinical data.
    Converts structured data into a clinical narrative for LLM analysis.
    """

    if report_type == "CMA":
        cnv      = str(extracted.get("cnv_result",      "unknown") or "unknown").lower()
        consang  = str(extracted.get("consanguinity",   "no")      or "no").lower()
        micro    = str(extracted.get("microdeletions",  "none")    or "none").lower()
        roh      = str(extracted.get("roh",             "no")      or "no").lower()
        cardiac  = extracted.get("cardiac_findings", []) or []

        findings = f"Chromosomal microarray analysis shows: CNV result is {cnv}"
        if "yes" in consang:
            findings += ", parents are consanguineous"
        if "detected" in micro or "present" in micro:
            findings += ", microdeletions detected"
        if "yes" in roh or "detected" in roh:
            findings += ", regions of homozygosity present"
        if cardiac and str(cardiac).lower() not in ("none", "null", "[]", ""):
            findings += f", cardiac findings: {', '.join(str(c) for c in cardiac)}"

        return f"""You are a prenatal genetic counselor scoring clinical risk.
{findings}.

Based on ONLY these findings, score the clinical risk from 0-10:
- 0-3.4: Low Risk
- 3.5-5.9: Moderate Risk
- 6.0-10: High Risk

Respond in JSON format ONLY (no markdown, no explanation):
{{
  "score": <number 0-10>,
  "risk_level": "<Low Risk|Moderate Risk|High Risk>",
  "key_factors": ["factor1", "factor2"],
  "reasoning": "brief clinical reasoning in one sentence"
}}"""

    elif report_type == "SCAN":
        anom    = extracted.get("anomalies", []) or []
        nt      = str(extracted.get("nt",         "normal") or "normal").lower()
        nasal   = str(extracted.get("nasal_bone", "normal") or "normal").lower()
        doppler = str(extracted.get("doppler",    "normal") or "normal").lower()
        liquor  = str(extracted.get("liquor",     "normal") or "normal").lower()

        findings = "Fetal ultrasound findings:"
        if anom:
            findings += f" anomalies detected ({', '.join(str(a) for a in anom)})"
        else:
            findings += " no structural anomalies detected"
        if "abnormal" in nt:
            findings += ", abnormal NT measurement"
        if "absent" in nasal:
            findings += ", absent nasal bone"
        elif "hypoplastic" in nasal:
            findings += ", hypoplastic nasal bone"
        if "abnormal" in doppler:
            findings += ", abnormal doppler findings"
        if "reduced" in liquor or "oligohydramnios" in liquor:
            findings += ", reduced amniotic fluid"
        elif "increased" in liquor or "polyhydramnios" in liquor:
            findings += ", increased amniotic fluid"

        return f"""You are a prenatal genetic counselor scoring clinical risk.
{findings}.

Based on ONLY these ultrasound findings, score the clinical risk from 0-10:
- 0-3.4: Low Risk
- 3.5-5.9: Moderate Risk
- 6.0-10: High Risk

Respond in JSON format ONLY (no markdown, no explanation):
{{
  "score": <number 0-10>,
  "risk_level": "<Low Risk|Moderate Risk|High Risk>",
  "key_factors": ["factor1", "factor2"],
  "reasoning": "brief clinical reasoning in one sentence"
}}"""

    elif report_type == "SERUM":
        nt_res    = str(extracted.get("nt_result",      "normal") or "normal").lower()
        nasal     = str(extracted.get("nasal_bone",     "normal") or "normal").lower()
        ductus    = str(extracted.get("ductus_venosus", "normal") or "normal").lower()
        tricuspid = str(extracted.get("tricuspid",      "no")     or "no").lower()
        ivf       = str(extracted.get("ivf",            "no")     or "no").lower()
        diabetic  = str(extracted.get("diabetic",       "no")     or "no").lower()
        risks     = extracted.get("risk_factors", []) or []

        findings = "Maternal serum screening results:"
        if "abnormal" in nt_res:
            findings += " abnormal NT result"
        if "absent" in nasal:
            findings += ", absent nasal bone"
        elif "hypoplastic" in nasal:
            findings += ", hypoplastic nasal bone"
        if "abnormal" in ductus:
            findings += ", abnormal ductus venosus"
        if "yes" in tricuspid or "present" in tricuspid:
            findings += ", tricuspid regurgitation present"
        if "yes" in ivf:
            findings += ", IVF pregnancy"
        if "yes" in diabetic:
            findings += ", diabetic patient"
        for rf in risks:
            rf_str = str(rf).strip()
            if rf_str and rf_str.lower() not in ("", "none", "null"):
                findings += f", risk factor: {rf_str}"

        return f"""You are a prenatal genetic counselor scoring clinical risk.
{findings}.

Based on ONLY these serum screening markers, score the clinical risk from 0-10:
- 0-3.4: Low Risk
- 3.5-5.9: Moderate Risk
- 6.0-10: High Risk

Respond in JSON format ONLY (no markdown, no explanation):
{{
  "score": <number 0-10>,
  "risk_level": "<Low Risk|Moderate Risk|High Risk>",
  "key_factors": ["factor1", "factor2"],
  "reasoning": "brief clinical reasoning in one sentence"
}}"""

    return ""


def score_with_llm(report_type: str, extracted: dict) -> dict | None:
    """
    Use Groq LLM to score clinical risk.
    Returns None if LLM unavailable or fails — caller falls back to rule engine.
    """
    if not client:
        logger.info("[LLM] Groq client not available — using rule engine fallback")
        return None

    try:
        prompt = _build_prompt(report_type, extracted)
        if not prompt:
            logger.warning(f"[LLM] No prompt built for report_type={report_type}")
            return None

        logger.info(f"[LLM] Calling Groq for {report_type} scoring")

        # ✅ FIX: correct Groq SDK syntax (was client.messages.create — Anthropic syntax)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=500,
            temperature=0.1,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        # ✅ FIX: correct Groq response parsing (was message.content[0].text — Anthropic syntax)
        response_text = response.choices[0].message.content
        logger.info(f"[LLM] Raw response: {response_text}")

        # Strip markdown fences if present
        cleaned = re.sub(r"```(?:json)?\s*", "", response_text).replace("```", "").strip()

        # Extract JSON object
        json_start = cleaned.find("{")
        json_end   = cleaned.rfind("}") + 1
        if json_start < 0 or json_end <= json_start:
            logger.warning("[LLM] No JSON found in response")
            return None

        json_str = cleaned[json_start:json_end]
        result   = json.loads(json_str)

        score      = float(result.get("score", 0))
        risk_level = result.get("risk_level", "Unknown")
        factors    = result.get("key_factors", [])
        reasoning  = result.get("reasoning", "")

        logger.info(f"[LLM] Parsed — score: {score}, risk: {risk_level}")

        return {
            "score":      score,
            "risk_level": risk_level,
            "factors":    factors,
            "reasoning":  reasoning
        }

    except json.JSONDecodeError as e:
        logger.warning(f"[LLM] JSON parse failed: {e} — using rule engine fallback")
        return None
    except Exception as e:
        logger.warning(f"[LLM] Groq call failed: {e} — using rule engine fallback")
        return None