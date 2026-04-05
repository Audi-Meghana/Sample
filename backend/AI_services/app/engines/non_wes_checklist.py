import os
import json
import re
import requests
import logging
import pandas as pd
from pathlib import Path

logger = logging.getLogger(__name__)
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# ─────────────────────────────────────────
# Base directory
# ─────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent


# ─────────────────────────────────────────
# Load datasets ONCE at startup
# ─────────────────────────────────────────
def _load_datasets():
    kb_data    = {}
    clinvar_df = pd.DataFrame()
    hpo_df     = pd.DataFrame()

    try:
        import joblib
        pkl_path   = BASE_DIR / "clinical_ai_model.pkl"
        model_data = joblib.load(str(pkl_path))
        kb_data    = model_data.get("kb_data", {})
        clinvar_df = model_data.get("clinvar_df", pd.DataFrame())
        logger.info(f"[OK] PKL loaded: {len(kb_data)} genes")
    except Exception as e:
        logger.warning(f"PKL load failed: {e}")

    try:
        hpo_path = BASE_DIR / "datasets" / "prenatal_hpo_phenotypes.csv"
        hpo_df   = pd.read_csv(str(hpo_path))
        logger.info(f"[OK] HPO loaded: {len(hpo_df)} phenotypes")
    except Exception as e:
        logger.warning(f"HPO load failed: {e}")

    return kb_data, clinvar_df, hpo_df


KB_DATA, CLINVAR_DF, HPO_DF = _load_datasets()


# ─────────────────────────────────────────
# Dataset helpers
# ─────────────────────────────────────────
def _lookup_hpo(finding: str) -> dict:
    if HPO_DF.empty:
        return {}
    finding_lower = finding.lower().strip()
    mask = HPO_DF["hpo_name"].str.lower().str.contains(
        finding_lower, na=False, regex=False
    )
    matches = HPO_DF[mask]
    if matches.empty:
        for word in finding_lower.split():
            if len(word) > 4:
                mask = HPO_DF["hpo_name"].str.lower().str.contains(
                    word, na=False, regex=False
                )
                matches = HPO_DF[mask]
                if not matches.empty:
                    break
    if matches.empty:
        return {}
    row = matches.iloc[0]
    return {
        "hpo_name":         str(row.get("hpo_name", "")),
        "prenatal_visible": bool(row.get("PrenatalVisible", 0)),
        "typical_week":     row.get("TypicalWeek", None)
    }


def _lookup_kb_for_finding(finding: str) -> list:
    if not KB_DATA:
        return []
    finding_lower = finding.lower()
    results = []
    for gene, gene_data in KB_DATA.items():
        all_findings = (
            gene_data.get("core_prenatal_findings", []) +
            gene_data.get("supportive_findings", [])
        )
        for f in all_findings:
            if (finding_lower in str(f).lower() or
                    str(f).lower() in finding_lower):
                results.append({
                    "gene":        gene,
                    "finding":     f,
                    "category":    gene_data.get("category", "Unknown"),
                    "inheritance": gene_data.get("inheritance", []),
                    "visibility":  gene_data.get("visibility_score", 0)
                })
                break
    results.sort(key=lambda x: x["visibility"], reverse=True)
    return results[:5]


# ─────────────────────────────────────────
# Groq call — module level function (NO self)
# ─────────────────────────────────────────
def _call_groq(prompt: str) -> list:
    try:
        api_key = os.getenv("GROQ_API_KEY")
        model   = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type":  "application/json"
        }
        body = {
            "model":    model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "max_tokens":  1500
        }
        resp    = requests.post(GROQ_URL, headers=headers, json=body, timeout=30)
        resp.raise_for_status()
        raw     = resp.json()["choices"][0]["message"]["content"].strip()
        cleaned = re.sub(r"```(?:json)?\s*", "", raw).replace("```", "").strip()
        return json.loads(cleaned)
    except Exception as e:
        logger.error(f"Groq failed: {e}")
        return []


# ─────────────────────────────────────────
# CMA Checklist
# ─────────────────────────────────────────
def generate_cma_checklist(data: dict) -> list:
    cardiac       = str(data.get("cardiac_findings", "") or "")
    consanguinity = str(data.get("consanguinity",    "") or "")

    kb_context = []
    if cardiac and cardiac.lower() not in ("none", "null", ""):
        kb_context = _lookup_kb_for_finding(cardiac)

    consanguinity_note = (
        "- Consanguinity YES → add extended carrier screening\n"
        "- Add autosomal recessive gene panel task\n"
        if consanguinity.lower() == "yes" else ""
    )

    prompt = f"""
You are a clinical geneticist. Provide a clinical significance summary from CMA report.

CMA Report Data:
- CNV Result: {data.get('cnv_result')}
- Aneuploidy: {json.dumps(data.get('aneuploidy', {}))}
- Microdeletions: {data.get('microdeletions')}
- ROH: {data.get('roh')}
- Consanguinity: {consanguinity}
- Cardiac Findings: {cardiac}
- Summary: {data.get('result_summary')}

Gene KB Context:
{json.dumps(kb_context, indent=2) if kb_context else "No direct match"}

{consanguinity_note}

Provide a concise clinical significance summary focusing on implications for pregnancy management. Avoid lists of tasks.

Return ONLY a JSON object:
{{
  "clinical_significance": "summary text here"
}}
"""
    result = _call_groq(prompt)
    if result and isinstance(result, dict):
        significance = result.get("clinical_significance", "No clinical significance noted.")
        return [{
            "task": significance,
            "status": "reviewed"
        }]
    return [{
        "task": "No clinical significance noted.",
        "status": "reviewed"
    }]


# ─────────────────────────────────────────
# SCAN Checklist
# ─────────────────────────────────────────
def generate_scan_checklist(data: dict) -> list:
    anomalies   = data.get("anomalies", []) or []
    hpo_context = []
    kb_context  = []

    # ✅ Handle case where anomalies is empty or null
    if not anomalies:
        return [{
            "task": "No anomalies detected",
            "status": "normal"
        }]

    for anomaly in anomalies[:5]:
        hpo = _lookup_hpo(anomaly)
        if hpo:
            hpo_context.append({
                "anomaly":          anomaly,
                "hpo_name":         hpo.get("hpo_name"),
                "prenatal_visible": hpo.get("prenatal_visible"),
                "typical_week":     hpo.get("typical_week")
            })
        kb = _lookup_kb_for_finding(anomaly)
        if kb:
            kb_context.extend(kb[:2])

    prompt = f"""
You are a fetal medicine specialist. Provide a clinical significance summary from ultrasound scan.

Scan Data:
- Scan Type: {data.get('scan_type')}
- Gestational Age: {data.get('gestational_age')}
- FHR: {data.get('fhr')} bpm
- Anomalies: {anomalies}
- NT: {data.get('nt')} mm
- Nasal Bone: {data.get('nasal_bone')}
- Doppler: {data.get('doppler')}
- Placenta: {data.get('placenta')}
- Liquor: {data.get('liquor')}
- Impression: {data.get('impression')}

HPO Context: {json.dumps(hpo_context) if hpo_context else "None"}
Gene KB Context: {json.dumps(kb_context) if kb_context else "None"}

Provide a concise clinical significance summary focusing on implications for pregnancy management.

Return ONLY a JSON object:
{{
  "clinical_significance": "summary text here"
}}
"""
    result = _call_groq(prompt)
    if result and isinstance(result, dict):
        significance = result.get("clinical_significance", "No clinical significance noted.")
        return [{
            "task": significance,
            "status": "reviewed"
        }]
    return [{
        "task": "No clinical significance noted.",
        "status": "reviewed"
    }]


# ─────────────────────────────────────────
# SERUM Checklist
# ─────────────────────────────────────────
def generate_serum_checklist(data: dict) -> list:
    nasal_bone  = str(data.get("nasal_bone", "") or "")
    nt_result   = str(data.get("nt_result",  "") or "")
    hpo_context = []

    if "absent" in nasal_bone.lower() or "hypoplastic" in nasal_bone.lower():
        hpo = _lookup_hpo("nasal bone hypoplasia")
        if hpo:
            hpo_context.append({"finding": "nasal bone", **hpo})

    if "abnormal" in nt_result.lower():
        hpo = _lookup_hpo("nuchal translucency")
        if hpo:
            hpo_context.append({"finding": "nuchal translucency", **hpo})

    prompt = f"""
You are an obstetrician. Provide a clinical significance summary from serum screening.

Serum Data:
- Screen Type: {data.get('screen_type')}
- Gestational Age: {data.get('gestational_age')}
- NT: {data.get('nt')} mm
- NT Result: {nt_result}
- Nasal Bone: {nasal_bone}
- Ductus Venosus: {data.get('ductus_venosus')}
- Tricuspid: {data.get('tricuspid')}
- IVF: {data.get('ivf')}
- Diabetic: {data.get('diabetic')}
- Risk Factors: {data.get('risk_factors', [])}

HPO Context: {json.dumps(hpo_context) if hpo_context else "None"}

Provide a concise clinical significance summary focusing on implications for pregnancy management.

Return ONLY a JSON object:
{{
  "clinical_significance": "summary text here"
}}
"""
    result = _call_groq(prompt)
    if result and isinstance(result, dict):
        significance = result.get("clinical_significance", "No clinical significance noted.")
        return [{
            "task": significance,
            "status": "reviewed"
        }]
    return [{
        "task": "No clinical significance noted.",
        "status": "reviewed"
    }]