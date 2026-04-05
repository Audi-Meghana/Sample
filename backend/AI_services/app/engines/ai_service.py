import re
import logging

logger = logging.getLogger(__name__)

print("DEBUG ai_service.py loading...")

# ── New imports ──
_non_wes_available = False
try:
    from app.engines.report_detector   import ReportDetector
    from app.engines.non_wes_extractor import NonWESExtractor
    from app.engines.non_wes_checklist import (
        generate_cma_checklist,
        generate_scan_checklist,
        generate_serum_checklist
    )
    _non_wes_available = True
    print("[OK] Non-WES engines loaded successfully")
except Exception as e:
    print(f"[ERROR] Non-WES engines failed to load: {e}")
    import traceback
    traceback.print_exc()

# ── Existing imports ──
from app.engines.genetic_extractor    import GeneticExtractor
from app.engines.visibility_engine    import GeneVisibilityModel
from app.engines.pp4_engine           import PP4Engine
from app.engines.clinvar_engine       import ClinVarEngine
from app.engines.nlp_phenotype_engine import NLPPhenotypeEngine


class ClinicalAIService:

    def __init__(self, kb_data=None, clinvar_df=None):

        self.genetic_extractor = GeneticExtractor(
            kb_data=kb_data,
            clinvar_df=clinvar_df
        )
        self.nlp_engine     = NLPPhenotypeEngine()
        self.pp4_engine     = PP4Engine()
        self.kb_data        = kb_data
        self.clinvar_engine = ClinVarEngine(clinvar_df)

        if _non_wes_available:
            self.report_detector   = ReportDetector()
            self.non_wes_extractor = NonWESExtractor()
            print("[OK] ReportDetector + NonWESExtractor initialized")
        else:
            self.report_detector   = None
            self.non_wes_extractor = None

    # =====================================================
    # STEP 1 — extract_structured (ONE definition only)
    # =====================================================

    def extract_structured(self, text, gestation=None, source="text"):

        print(f"DEBUG extract_structured called with source={source}")

        # ── Detect report type ──
        if self.report_detector:
            report_type = self.report_detector.detect(text, source=source)
        else:
            # ✅ FIX: PDF/audio/video default to SCAN; text input defaults to WES
            report_type = "SCAN" if source in ("audio", "video", "pdf") else "WES"

        print(f"DEBUG report_type: {report_type} (source: {source})")

        # ── CMA ──
        if report_type == "CMA" and _non_wes_available:
            print("DEBUG → CMA block")
            try:
                extracted = self.non_wes_extractor.extract_cma(text)
                print(f"DEBUG CMA extracted ok: {extracted.get('cnv_result')}")
                checklist = generate_cma_checklist(extracted)
                print(f"DEBUG CMA checklist count: {len(checklist)}")
                return {
                    "report_type":          "CMA",
                    "extracted":            extracted,
                    "checklist":            checklist,
                    "suggested_phenotypes": [],
                    "genetic": {
                        "gene":       "NOT_APPLICABLE",
                        "variant":    None,
                        "confidence": 0.0,
                        "status":     "ok"
                    }
                }
            except Exception as e:
                print(f"DEBUG CMA FAILED: {e}")
                import traceback
                traceback.print_exc()
                return {
                    "report_type": "CMA",
                    "error":       str(e),
                    "extracted":   {},
                    "checklist":   [],
                    "suggested_phenotypes": [],
                    "genetic": {
                        "gene": "NOT_APPLICABLE",
                        "variant": None,
                        "confidence": 0.0,
                        "status": "error"
                    }
                }

        # ── SCAN ──
        elif report_type == "SCAN" and _non_wes_available:
            print("DEBUG → SCAN block")
            try:
                extracted = self.non_wes_extractor.extract_scan(text)
                print(f"DEBUG SCAN extracted ok")
                checklist = generate_scan_checklist(extracted)
                print(f"DEBUG SCAN checklist count: {len(checklist)}")
                return {
                    "report_type":          "SCAN",
                    "extracted":            extracted,
                    "checklist":            checklist,
                    "suggested_phenotypes": [],
                    "genetic": {
                        "gene":       "NOT_APPLICABLE",
                        "variant":    None,
                        "confidence": 0.0,
                        "status":     "ok"
                    }
                }
            except Exception as e:
                print(f"DEBUG SCAN FAILED: {e}")
                import traceback
                traceback.print_exc()
                return {
                    "report_type": "SCAN",
                    "error":       str(e),
                    "extracted":   {},
                    "checklist":   [],
                    "suggested_phenotypes": [],
                    "genetic": {
                        "gene": "NOT_APPLICABLE",
                        "variant": None,
                        "confidence": 0.0,
                        "status": "error"
                    }
                }

        # ── SERUM ──
        elif report_type == "SERUM" and _non_wes_available:
            print("DEBUG → SERUM block")
            try:
                extracted = self.non_wes_extractor.extract_serum(text)
                print(f"DEBUG SERUM extracted ok")
                checklist = generate_serum_checklist(extracted)
                print(f"DEBUG SERUM checklist count: {len(checklist)}")
                return {
                    "report_type":          "SERUM",
                    "extracted":            extracted,
                    "checklist":            checklist,
                    "suggested_phenotypes": [],
                    "genetic": {
                        "gene":       "NOT_APPLICABLE",
                        "variant":    None,
                        "confidence": 0.0,
                        "status":     "ok"
                    }
                }
            except Exception as e:
                print(f"DEBUG SERUM FAILED: {e}")
                import traceback
                traceback.print_exc()
                return {
                    "report_type": "SERUM",
                    "error":       str(e),
                    "extracted":   {},
                    "checklist":   [],
                    "suggested_phenotypes": [],
                    "genetic": {
                        "gene": "NOT_APPLICABLE",
                        "variant": None,
                        "confidence": 0.0,
                        "status": "error"
                    }
                }

        # ── WES — existing logic unchanged ──
    # ── WES — existing logic ──
        print("DEBUG → WES block")
        if source == "pdf":
            genetic = self.genetic_extractor.extract_pdf(text)
        else:
            genetic = self.genetic_extractor.extract_text(text)

        gene = genetic.get("gene")

        if not gene or gene == "UNKNOWN":
            return {
                "report_type":          "WES",
                "genetic":              genetic,
                "suggested_phenotypes": [],
                "checklist":            {},   # ← empty checklist
                "warning":              "Gene not detected."
            }

        try:
            visibility = GeneVisibilityModel(gene, self.kb_data)
        except Exception:
            return {
                "report_type":          "WES",
                "genetic":              genetic,
                "suggested_phenotypes": [],
                "checklist":            {},
                "warning": f"Gene {gene} not found in knowledge base."
            }

        checklist = visibility.checklist()
        checklist_terms = (
            checklist.get("core_prenatal_findings", []) +
            checklist.get("supportive_findings", [])
        )
        suggested = self.nlp_engine.extract_from_checklist(
            text, checklist_terms
        )

        # ✅ NOW returns checklist directly with extract-pdf
        return {
            "report_type":          "WES",
            "genetic":              genetic,
            "suggested_phenotypes": suggested,
            "checklist":            checklist,    # ← ADD THIS
            "metadata":             visibility.metadata()  # ← ADD THIS
        }


    # =====================================================
    # STEP 2 — Generate Checklist (UNCHANGED)
    # =====================================================

    def generate_checklist(self, gene):
        visibility = GeneVisibilityModel(gene, self.kb_data)
        return {
            "metadata":  visibility.metadata(),
            "checklist": visibility.checklist()
        }

    # =====================================================
    # STEP 3 — Calculate PP4 (UNCHANGED)
    # =====================================================

    def calculate_pp4(self, gene, gestation, selections):
        visibility = GeneVisibilityModel(gene, self.kb_data)
        metadata   = visibility.metadata()
        return self.pp4_engine.calculate(
            selections=selections,
            gestation=gestation,
            visibility_score=metadata.get("visibility_score", 0),
            gestational_profile=metadata.get(
                "gestational_visibility_profile", {}
            ),
            alternative_diagnosis=0,
            confidence_factor=metadata.get("confidence_factor", 1.0)
        )

    # =====================================================
    # STEP 4 — Generate Summaries (UNCHANGED)
    # =====================================================

    def generate_summaries(self, gene, pp4_result):
        score = round(pp4_result.get("final_score", 0), 2)

        if score >= 4:
            risk_level     = "High Risk"
            doctor_action  = (
                "Urgent specialist evaluation is recommended. "
                "Consider detailed fetal imaging and multidisciplinary review."
            )
            patient_action = (
                "Please consult your doctor as soon as possible for further evaluation."
            )
        elif score >= 3:
            risk_level     = "Moderate Risk"
            doctor_action  = (
                "Further diagnostic evaluation and close follow-up are advised."
            )
            patient_action = (
                "We recommend discussing these findings with your doctor for further guidance."
            )
        else:
            risk_level     = "Low Risk"
            doctor_action  = (
                "Routine monitoring is appropriate unless new findings appear."
            )
            patient_action = (
                "At this time, the findings suggest a low likelihood. "
                "Regular prenatal check-ups are important."
            )

        doctor_summary = (
            f"Gene: {gene}\n"
            f"Final PP4 Score: {score}\n"
            f"Risk Category: {risk_level}\n\n"
            f"Interpretation:\n"
            f"The clinical findings show a {risk_level.lower()} "
            f"correlation with the gene.\n\n"
            f"Recommended Action:\n"
            f"{doctor_action}"
        )

        patient_summary = (
            f"Your test related to {gene} shows a {risk_level.lower()} "
            f"based on the ultrasound findings.\n\n"
            f"This result does not confirm a diagnosis, "
            f"but helps your healthcare team understand possible risk.\n\n"
            f"{patient_action}"
        )

        return {
            "doctor_summary":  doctor_summary,
            "patient_summary": patient_summary,
            "risk_level":      risk_level
        }