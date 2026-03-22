"""
Clinical Risk Score Engine
Calculates risk scores for CMA, SCAN, and SERUM reports
as an equivalent to PP4 scoring for WES reports.
"""

import logging

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────
# SEVERITY WEIGHTS
# ─────────────────────────────────────────

# CMA scoring weights
CMA_WEIGHTS = {
    "cnv_abnormal":        4.0,
    "consanguinity":       2.0,
    "cardiac_finding":     3.0,
    "microdeletion":       3.0,
    "roh_detected":        2.0,
    "sex_chrom_abnormal":  2.0,
    "trisomy":             4.0,
}

# SCAN anomaly severity weights
SCAN_ANOMALY_WEIGHTS = {
    # Brain/CNS — high severity
    "pontocerebellar hypoplasia":     4.5,
    "cerebellar hypoplasia":          4.0,
    "ventriculomegaly":               3.5,
    "bilateral prominent ventricles": 3.0,
    "prefrontal edema":               2.5,
    "vermian hypoplasia":             3.5,
    "microcephaly":                   4.0,
    "holoprosencephaly":              4.5,
    "dandy walker":                   4.0,
    "corpus callosum":                3.5,

    # Cardiac — high severity
    "right aortic arch":              3.0,
    "ductal arch":                    3.0,
    "cardiac":                        3.0,
    "heart":                          3.0,
    "ventricular septal":             3.5,
    "echogenic foci":                 1.5,

    # Skeletal — moderate
    "club foot":                      2.0,
    "syndactyly":                     2.0,
    "skeletal":                       2.0,
    "limb":                           2.0,

    # Soft markers — low
    "hypoplastic nasal bone":         2.5,
    "nasal bone":                     2.0,
    "echogenic bowel":                1.5,
    "choroid plexus":                 1.0,
    "renal pelvis":                   1.5,

    # Vascular
    "uteroplacental insufficiency":   3.0,
    "doppler":                        2.5,
    "umbilical":                      2.5,

    # Default for unknown anomalies
    "default":                        2.0,
}

# SCAN marker weights
SCAN_MARKER_WEIGHTS = {
    "absent_nasal_bone":    3.0,
    "hypoplastic_nasal":    2.0,
    "abnormal_nt":          3.0,
    "abnormal_doppler":     2.5,
    "reduced_liquor":       2.0,
    "increased_liquor":     1.5,
    "short_cervix":         2.0,
}

# SERUM marker weights
SERUM_WEIGHTS = {
    "absent_nasal_bone":       3.0,
    "hypoplastic_nasal":       2.0,
    "abnormal_nt":             3.0,
    "abnormal_ductus_venosus": 2.5,
    "tricuspid_regurgitation": 2.0,
    "ivf_pregnancy":           1.0,
    "diabetic":                0.5,
    "risk_factor":             1.0,
}

MAX_SCORE = 10.0


# ─────────────────────────────────────────
# RISK LEVEL CALCULATOR
# ─────────────────────────────────────────

def _get_risk_level(score: float) -> dict:
    if score >= 6.0:
        return {
            "risk_level":      "High Risk",
            "risk_color":      "red",
            "doctor_action":   (
                "Urgent specialist evaluation is recommended. "
                "Consider detailed fetal imaging, genetic counseling, "
                "and multidisciplinary team review immediately."
            ),
            "patient_action":  (
                "Please consult your doctor as soon as possible. "
                "Further evaluation is needed based on these findings."
            )
        }
    elif score >= 3.5:
        return {
            "risk_level":      "Moderate Risk",
            "risk_color":      "amber",
            "doctor_action":   (
                "Further diagnostic evaluation and close follow-up are advised. "
                "Consider specialist referral based on specific findings."
            ),
            "patient_action":  (
                "We recommend discussing these findings with your doctor "
                "for further guidance and monitoring."
            )
        }
    else:
        return {
            "risk_level":      "Low Risk",
            "risk_color":      "green",
            "doctor_action":   (
                "Routine monitoring is appropriate. "
                "Continue standard prenatal care with scheduled follow-ups."
            ),
            "patient_action":  (
                "The findings suggest a lower risk level. "
                "Regular prenatal check-ups remain important."
            )
        }


def _clamp_score(raw: float) -> float:
    """Clamp score to 0-10 range."""
    return round(min(max(raw, 0.0), MAX_SCORE), 2)


def _get_anomaly_weight(anomaly: str) -> float:
    """Get severity weight for a scan anomaly."""
    anomaly_lower = anomaly.lower()
    for key, weight in SCAN_ANOMALY_WEIGHTS.items():
        if key in anomaly_lower or anomaly_lower in key:
            return weight
    return SCAN_ANOMALY_WEIGHTS["default"]


# ─────────────────────────────────────────
# CMA RISK SCORE
# ─────────────────────────────────────────

def calculate_cma_score(extracted: dict) -> dict:
    """
    Calculate Clinical Risk Score for CMA reports.
    Returns PP4-equivalent structure.
    """
    logger.info(f"[CMA] Extracted data received: {extracted}")
    
    raw_score = 0.0
    factors   = []

    cnv_result    = str(extracted.get("cnv_result", "") or "").lower()
    consanguinity = str(extracted.get("consanguinity", "") or "").lower()
    microdeletions= str(extracted.get("microdeletions", "") or "").lower()
    roh           = str(extracted.get("roh", "") or "").lower()
    aneuploidy    = extracted.get("aneuploidy", {}) or {}
    cardiac       = extracted.get("cardiac_findings", []) or []
    
    logger.info(f"[CMA] Parsed fields: cnv={cnv_result}, consanguinity={consanguinity}, microdel={microdeletions}, roh={roh}")

    # CNV Abnormal
    if "abnormal" in cnv_result:
        raw_score += CMA_WEIGHTS["cnv_abnormal"]
        factors.append("CNV Abnormal detected (+4.0)")

    # Trisomy
    for k, v in aneuploidy.items():
        if str(v).lower() == "positive":
            raw_score += CMA_WEIGHTS["trisomy"]
            factors.append(f"Aneuploidy positive: {k} (+4.0)")

    # Consanguinity
    if "yes" in consanguinity:
        raw_score += CMA_WEIGHTS["consanguinity"]
        factors.append("Consanguineous marriage (+2.0)")

    # Cardiac findings
    if cardiac and len(cardiac) > 0:
        cardiac_str = str(cardiac).lower()
        if cardiac_str not in ("none", "null", "[]", ""):
            raw_score += CMA_WEIGHTS["cardiac_finding"]
            factors.append(f"Cardiac findings detected (+3.0)")

    # Microdeletions
    if "negative" not in microdeletions and microdeletions not in ("", "null", "none"):
        raw_score += CMA_WEIGHTS["microdeletion"]
        factors.append("Microdeletion detected (+3.0)")

    # ROH
    if roh not in ("none", "null", "", "no significant"):
        raw_score += CMA_WEIGHTS["roh_detected"]
        factors.append("Regions of Homozygosity detected (+2.0)")

    final_score = _clamp_score(raw_score)
    risk_info   = _get_risk_level(final_score)

    return {
        "score_type":    "Clinical Risk Score (CMA)",
        "report_type":   "CMA",
        "raw_score":     round(raw_score, 2),
        "final_score":   final_score,
        "multiplier":    1.0,
        "max_score":     MAX_SCORE,
        "state":         f"CMA_{risk_info['risk_level'].replace(' ', '_').upper()}",
        "risk_level":    risk_info["risk_level"],
        "risk_color":    risk_info["risk_color"],
        "scoring_factors": factors,
        "doctor_summary": (
            f"CMA Report Clinical Risk Score: {final_score}/10\n"
            f"Risk Category: {risk_info['risk_level']}\n\n"
            f"Key Findings:\n"
            + "\n".join(f"  • {f}" for f in factors) +
            f"\n\nRecommended Action:\n{risk_info['doctor_action']}"
        ),
        "patient_summary": (
            f"Your chromosomal microarray test shows a "
            f"{risk_info['risk_level'].lower()} based on the findings.\n\n"
            f"This result does not confirm a diagnosis, "
            f"but helps your healthcare team understand possible risk.\n\n"
            f"{risk_info['patient_action']}"
        )
    }


# ─────────────────────────────────────────
# SCAN RISK SCORE
# ─────────────────────────────────────────

def calculate_scan_score(extracted: dict) -> dict:
    """
    Calculate Clinical Risk Score for Ultrasound Scan reports.
    Returns PP4-equivalent structure.
    """
    raw_score = 0.0
    factors   = []

    anomalies     = extracted.get("anomalies", []) or []
    nt            = str(extracted.get("nt", "") or "").lower()
    nasal_bone    = str(extracted.get("nasal_bone", "") or "").lower()
    doppler       = str(extracted.get("doppler", "") or "").lower()
    liquor        = str(extracted.get("liquor", "") or "").lower()
    cervical_len  = extracted.get("cervical_length")

    # Score each anomaly
    for anomaly in anomalies:
        weight = _get_anomaly_weight(str(anomaly))
        raw_score += weight
        factors.append(f"{anomaly} (+{weight})")

    # NT measurement
    if nt and "abnormal" in nt:
        raw_score += SCAN_MARKER_WEIGHTS["abnormal_nt"]
        factors.append(f"Abnormal NT measurement (+3.0)")

    # Nasal bone
    if "absent" in nasal_bone:
        raw_score += SCAN_MARKER_WEIGHTS["absent_nasal_bone"]
        factors.append("Absent nasal bone (+3.0)")
    elif "hypoplastic" in nasal_bone:
        raw_score += SCAN_MARKER_WEIGHTS["hypoplastic_nasal"]
        factors.append("Hypoplastic nasal bone (+2.0)")

    # Doppler
    if doppler and "normal" not in doppler and doppler not in ("", "null", "none"):
        raw_score += SCAN_MARKER_WEIGHTS["abnormal_doppler"]
        factors.append(f"Abnormal Doppler: {doppler} (+2.5)")

    # Liquor
    if "reduced" in liquor or "oligohydramnios" in liquor:
        raw_score += SCAN_MARKER_WEIGHTS["reduced_liquor"]
        factors.append("Reduced amniotic fluid (+2.0)")
    elif "increased" in liquor or "polyhydramnios" in liquor:
        raw_score += SCAN_MARKER_WEIGHTS["increased_liquor"]
        factors.append("Increased amniotic fluid (+1.5)")

    # Cervical length
    if cervical_len:
        try:
            cl = float(str(cervical_len).replace("mm", "").strip())
            if cl < 25:
                raw_score += SCAN_MARKER_WEIGHTS["short_cervix"]
                factors.append(f"Short cervix: {cl}mm (+2.0)")
        except Exception:
            pass

    final_score = _clamp_score(raw_score)
    risk_info   = _get_risk_level(final_score)

    scan_type = extracted.get("scan_type", "Ultrasound")
    ga        = extracted.get("gestational_age", "Unknown")

    return {
        "score_type":    "Clinical Risk Score (Scan)",
        "report_type":   "SCAN",
        "raw_score":     round(raw_score, 2),
        "final_score":   final_score,
        "multiplier":    1.0,
        "max_score":     MAX_SCORE,
        "state":         f"SCAN_{risk_info['risk_level'].replace(' ', '_').upper()}",
        "risk_level":    risk_info["risk_level"],
        "risk_color":    risk_info["risk_color"],
        "scoring_factors": factors,
        "doctor_summary": (
            f"Ultrasound Scan Clinical Risk Score: {final_score}/10\n"
            f"Scan Type: {scan_type} | GA: {ga}\n"
            f"Risk Category: {risk_info['risk_level']}\n\n"
            f"Anomalies & Findings:\n"
            + "\n".join(f"  • {f}" for f in factors) +
            f"\n\nRecommended Action:\n{risk_info['doctor_action']}"
        ),
        "patient_summary": (
            f"Your ultrasound scan shows a "
            f"{risk_info['risk_level'].lower()} based on the findings.\n\n"
            f"This result does not confirm a diagnosis, "
            f"but helps your healthcare team understand possible risk.\n\n"
            f"{risk_info['patient_action']}"
        )
    }


# ─────────────────────────────────────────
# SERUM RISK SCORE
# ─────────────────────────────────────────

def calculate_serum_score(extracted: dict) -> dict:
    """
    Calculate Clinical Risk Score for Maternal Serum Screening.
    Returns PP4-equivalent structure.
    """
    raw_score = 0.0
    factors   = []

    nt_result     = str(extracted.get("nt_result", "") or "").lower()
    nasal_bone    = str(extracted.get("nasal_bone", "") or "").lower()
    ductus        = str(extracted.get("ductus_venosus", "") or "").lower()
    tricuspid     = str(extracted.get("tricuspid", "") or "").lower()
    ivf           = str(extracted.get("ivf", "") or "").lower()
    diabetic      = str(extracted.get("diabetic", "") or "").lower()
    risk_factors  = extracted.get("risk_factors", []) or []

    # NT result
    if "abnormal" in nt_result:
        raw_score += SERUM_WEIGHTS["abnormal_nt"]
        factors.append("Abnormal NT measurement (+3.0)")

    # Nasal bone
    if "absent" in nasal_bone:
        raw_score += SERUM_WEIGHTS["absent_nasal_bone"]
        factors.append("Absent nasal bone — aneuploidy risk (+3.0)")
    elif "hypoplastic" in nasal_bone:
        raw_score += SERUM_WEIGHTS["hypoplastic_nasal"]
        factors.append("Hypoplastic nasal bone (+2.0)")

    # Ductus venosus
    if "abnormal" in ductus or ("normal" not in ductus and ductus not in ("", "null", "none")):
        if ductus not in ("", "null", "none"):
            raw_score += SERUM_WEIGHTS["abnormal_ductus_venosus"]
            factors.append("Abnormal ductus venosus (+2.5)")

    # Tricuspid regurgitation
    if "present" in tricuspid or "yes" in tricuspid or "tr" in tricuspid:
        raw_score += SERUM_WEIGHTS["tricuspid_regurgitation"]
        factors.append("Tricuspid regurgitation present (+2.0)")

    # IVF
    if "yes" in ivf:
        raw_score += SERUM_WEIGHTS["ivf_pregnancy"]
        factors.append("IVF pregnancy (+1.0)")

    # Diabetic
    if "yes" in diabetic:
        raw_score += SERUM_WEIGHTS["diabetic"]
        factors.append("Diabetic patient (+0.5)")

    # Risk factors
    for rf in risk_factors:
        rf_str = str(rf).strip()
        if rf_str and rf_str.lower() not in ("", "none", "null"):
            raw_score += SERUM_WEIGHTS["risk_factor"]
            factors.append(f"Risk factor: {rf_str} (+1.0)")

    final_score = _clamp_score(raw_score)
    risk_info   = _get_risk_level(final_score)

    screen_type = extracted.get("screen_type", "Serum Screen")
    ga          = extracted.get("gestational_age", "Unknown")

    return {
        "score_type":    "Clinical Risk Score (Serum)",
        "report_type":   "SERUM",
        "raw_score":     round(raw_score, 2),
        "final_score":   final_score,
        "multiplier":    1.0,
        "max_score":     MAX_SCORE,
        "state":         f"SERUM_{risk_info['risk_level'].replace(' ', '_').upper()}",
        "risk_level":    risk_info["risk_level"],
        "risk_color":    risk_info["risk_color"],
        "scoring_factors": factors,
        "doctor_summary": (
            f"Serum Screening Clinical Risk Score: {final_score}/10\n"
            f"Screen Type: {screen_type} | GA: {ga}\n"
            f"Risk Category: {risk_info['risk_level']}\n\n"
            f"Risk Markers:\n"
            + "\n".join(f"  • {f}" for f in factors) +
            f"\n\nRecommended Action:\n{risk_info['doctor_action']}"
        ),
        "patient_summary": (
            f"Your serum screening shows a "
            f"{risk_info['risk_level'].lower()} based on the markers.\n\n"
            f"This result does not confirm a diagnosis, "
            f"but helps your healthcare team understand possible risk.\n\n"
            f"{risk_info['patient_action']}"
        )
    }


# ─────────────────────────────────────────
# MAIN ROUTER
# ─────────────────────────────────────────

def calculate_clinical_risk_score(report_type: str, extracted: dict) -> dict:
    """
    Main entry point — tries LLM first, falls back to rule engine.
    Returns PP4-compatible structure.
    """
    logger.info(f"[ROUTER] Calculating clinical risk score for {report_type}")
    logger.info(f"[ROUTER] Extracted data keys: {list(extracted.keys())}")
    
    # Try LLM-based scoring first
    from app.engines.llm_risk_scorer import score_with_llm
    
    llm_result = score_with_llm(report_type, extracted)
    if llm_result:
        logger.info(f"[ROUTER] LLM scoring succeeded: {llm_result['score']}")
        
        # Format LLM result into PP4-compatible structure
        risk_info = {
            "risk_level": llm_result["risk_level"],
            "risk_color": "green" if "Low" in llm_result["risk_level"] else ("amber" if "Moderate" in llm_result["risk_level"] else "red"),
            "doctor_action": f"Risk Score: {llm_result['score']}/10. Reasoning: {llm_result['reasoning']}",
            "patient_action": "Please consult your doctor for detailed interpretation."
        }
        
        final_score = _clamp_score(llm_result["score"])
        return {
            "score_type":    f"Clinical Risk Score ({report_type})",
            "report_type":   report_type,
            "raw_score":     llm_result["score"],
            "final_score":   final_score,
            "multiplier":    1.0,
            "max_score":     MAX_SCORE,
            "state":         f"{report_type}_{risk_info['risk_level'].replace(' ', '_').upper()}",
            "risk_level":    risk_info["risk_level"],
            "risk_color":    risk_info["risk_color"],
            "scoring_factors": llm_result["factors"],
            "doctor_summary": f"Clinical Risk Score ({report_type}): {final_score}/10\nRisk Category: {risk_info['risk_level']}\n\nAnalysis:\n{llm_result['reasoning']}",
            "patient_summary": f"Based on clinical findings, your risk assessment is {risk_info['risk_level']}. Please discuss with your healthcare provider."
        }
    
    # Fallback to rule engine
    logger.info(f"[ROUTER] LLM failed or unavailable, using rule engine fallback")

    if report_type == "CMA":
        return calculate_cma_score(extracted)
    elif report_type == "SCAN":
        return calculate_scan_score(extracted)
    elif report_type == "SERUM":
        return calculate_serum_score(extracted)
    else:
        logger.warning(f"[ROUTER] Unknown report type: {report_type}")
        return {
            "score_type":  "Unknown",
            "report_type": report_type,
            "raw_score":   0.0,
            "final_score": 0.0,
            "multiplier":  1.0,
            "max_score":   MAX_SCORE,
            "state":       "UNKNOWN",
            "risk_level":  "Unknown",
            "risk_color":  "slate",
            "scoring_factors": [],
            "doctor_summary":  "Report type not supported for risk scoring.",
            "patient_summary": "Please consult your doctor for interpretation."
        }