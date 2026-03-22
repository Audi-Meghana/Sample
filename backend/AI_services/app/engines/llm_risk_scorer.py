"""
LLM-Based Clinical Risk Scorer
Uses Groq LLM to analyze clinical findings and generate risk scores
with intelligent reasoning. Falls back to rule engine if LLM unavailable.
"""

import json
import logging
import os
from groq import Groq

logger = logging.getLogger(__name__)

# Initialize Groq client
try:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
except Exception as e:
    logger.warning(f"Groq client init failed: {e}")
    client = None


def _build_prompt(report_type: str, extracted: dict) -> str:
    """
    Build a natural language prompt from extracted clinical data.
    Converts structured data into a clinical narrative for LLM analysis.
    """
    if report_type == "CMA":
        cnv = extracted.get("cnv_result", "unknown").lower()
        consang = extracted.get("consanguinity", "no").lower()
        micro = extracted.get("microdeletions", "none").lower()
        roh = extracted.get("roh", "no").lower()
        cardiac = extracted.get("cardiac_findings", [])
        
        findings = f"Chromosomal microarray analysis shows: CNV result is {cnv}"
        if "yes" in consang:
            findings += ", parents are consanguineous"
        if "detected" in micro or "present" in micro:
            findings += ", microdeletions detected"
        if "yes" in roh or "detected" in roh:
            findings += ", regions of homozygosity present"
        if cardiac:
            findings += f", cardiac findings: {', '.join(str(c) for c in cardiac)}"
        
        return f"""You are a prenatal genetic counselor scoring clinical risk.
{findings}.

Based on ONLY these findings, score the clinical risk from 0-10:
- 0-3.4: Low Risk
- 3.5-5.9: Moderate Risk  
- 6.0-10: High Risk

Respond in JSON format ONLY:
{{
  "score": <number 0-10>,
  "risk_level": "<Low/Moderate/High> Risk",
  "key_factors": ["factor1", "factor2"],
  "reasoning": "brief clinical reasoning"
}}"""

    elif report_type == "SCAN":
        anom = extracted.get("anomalies", [])
        nt = extracted.get("nt", "normal").lower()
        nasal = extracted.get("nasal_bone", "normal").lower()
        doppler = extracted.get("doppler", "normal").lower()
        liquor = extracted.get("liquor", "normal").lower()
        
        findings = "Fetal ultrasound findings:"
        if anom:
            findings += f" anomalies detected ({', '.join(str(a) for a in anom)})"
        if "abnormal" in nt:
            findings += ", abnormal NT measurement"
        if "absent" in nasal:
            findings += ", absent nasal bone"
        elif "hypoplastic" in nasal:
            findings += ", hypoplastic nasal bone"
        if "abnormal" in doppler:
            findings += ", abnormal doppler findings"
        if "reduced" in liquor:
            findings += ", reduced amniotic fluid"
        elif "increased" in liquor:
            findings += ", increased amniotic fluid"
            
        return f"""You are a prenatal genetic counselor scoring clinical risk.
{findings}.

Based on ONLY these ultrasound findings, score the clinical risk from 0-10:
- 0-3.4: Low Risk
- 3.5-5.9: Moderate Risk
- 6.0-10: High Risk

Respond in JSON format ONLY:
{{
  "score": <number 0-10>,
  "risk_level": "<Low/Moderate/High> Risk",
  "key_factors": ["factor1", "factor2"],
  "reasoning": "brief clinical reasoning"
}}"""

    elif report_type == "SERUM":
        nt_res = extracted.get("nt_result", "normal").lower()
        nasal = extracted.get("nasal_bone", "normal").lower()
        ductus = extracted.get("ductus_venosus", "normal").lower()
        tricuspid = extracted.get("tricuspid", "no").lower()
        
        findings = "Serum screening results:"
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
            
        return f"""You are a prenatal genetic counselor scoring clinical risk.
{findings}.

Based on ONLY these serum screening markers, score the clinical risk from 0-10:
- 0-3.4: Low Risk
- 3.5-5.9: Moderate Risk
- 6.0-10: High Risk

Respond in JSON format ONLY:
{{
  "score": <number 0-10>,
  "risk_level": "<Low/Moderate/High> Risk",
  "key_factors": ["factor1", "factor2"],
  "reasoning": "brief clinical reasoning"
}}"""

    return ""


def score_with_llm(report_type: str, extracted: dict) -> dict | None:
    """
    Use Groq LLM to score clinical risk.
    Returns None if LLM unavailable or fails.
    """
    if not client:
        logger.info("[LLM] Groq client not available, will use fallback")
        return None
        
    try:
        prompt = _build_prompt(report_type, extracted)
        if not prompt:
            return None
            
        logger.info(f"[LLM] Calling Groq for {report_type} scoring")
        
        message = client.messages.create(
            model="llama-3.3-70b-versatile",
            max_tokens=500,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        response_text = message.content[0].text
        logger.info(f"[LLM] Raw response: {response_text}")
        
        # Parse JSON from response
        json_start = response_text.find("{")
        json_end = response_text.rfind("}") + 1
        if json_start < 0 or json_end <= json_start:
            logger.warning("[LLM] No JSON found in response")
            return None
            
        json_str = response_text[json_start:json_end]
        result = json.loads(json_str)
        
        logger.info(f"[LLM] Parsed score: {result.get('score')}, risk: {result.get('risk_level')}")
        
        return {
            "score": float(result.get("score", 0)),
            "risk_level": result.get("risk_level", "Unknown"),
            "factors": result.get("key_factors", []),
            "reasoning": result.get("reasoning", "")
        }
        
    except json.JSONDecodeError as e:
        logger.warning(f"[LLM] JSON parse failed: {e}")
        return None
    except Exception as e:
        logger.warning(f"[LLM] Groq call failed: {e}")
        return None
