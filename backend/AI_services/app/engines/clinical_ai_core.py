from .genetic_extractor import GeneticExtractor
from .visibility_engine import GeneVisibilityModel
from .pp4_engine import PP4Engine
from .clinvar_engine import ClinVarEngine
from .nlp_phenotype_engine import NLPPhenotypeEngine
import re

class ClinicalAICore:

    def __init__(self):
        self.genetic_extractor = GeneticExtractor()
        self.nlp_engine = NLPPhenotypeEngine()
        self.pp4_engine = PP4Engine()
        self.clinvar_engine = ClinVarEngine()

   
    def extract_structured(self, text, gestation=None, source="text"):

        if source == "pdf":
            genetic = self.genetic_extractor.extract_pdf(text)
        elif source == "audio":
            genetic = self.genetic_extractor.extract_text(text)
        elif source == "video":

            if re.search(r"\bGene\s+Identified\b", text, re.IGNORECASE):
                genetic = self.genetic_extractor.extract_text(text)
            else:
                genetic = self.genetic_extractor.extract_text(text)
        else:
            genetic = self.genetic_extractor.extract_text(text)

        gene = genetic.get("gene")

        if not gene or gene == "UNKNOWN":
            return {
                "genetic": genetic,
                "suggested_phenotypes": [],
                "warning": "Gene not detected."
            }

        try:
            visibility = GeneVisibilityModel(gene)
        except ValueError:
            return {
                "genetic": genetic,
                "suggested_phenotypes": [],
                "warning": f"Gene {gene} not found in knowledge base."
            }

        checklist = visibility.checklist()

        checklist_terms = (
            checklist.get("core_prenatal_findings", []) +
            checklist.get("supportive_findings", [])
        )

        suggested = self.nlp_engine.extract_from_checklist(
            text,
            checklist_terms
        )

        return {
            "genetic": genetic,
            "suggested_phenotypes": suggested
        }

    
    def generate_checklist(self, gene):

        visibility = GeneVisibilityModel(gene)
        metadata = visibility.metadata()
        checklist = visibility.checklist()

        return {
            "metadata": metadata,
            "checklist": checklist
        }

    # -----------------------------------------
    # STEP 3: Calculate PP4
    # -----------------------------------------
    def calculate_pp4(self, gene, gestation, selections):

        visibility = GeneVisibilityModel(gene)
        metadata = visibility.metadata()

        result = self.pp4_engine.calculate(
            selections=selections,
            gestation=gestation,
            visibility_score=metadata.get("visibility_score", 0),
            gestational_profile=metadata.get("gestational_visibility_profile", {}),
            alternative_diagnosis=0,
            confidence_factor=metadata.get("confidence_factor", 1.0)
        )
        print("Gene:", gene)
        print("Visibility score:", metadata.get("visibility_score"))
        print("Confidence factor:", metadata.get("confidence_factor"))
        print("Selections:", selections)
       
        return result
   
    
    def generate_summaries(self, gene, pp4_result):

        score = round(pp4_result.get("final_score", 0), 2)

        
        if score >= 4:
            risk_level = "High Risk"
            doctor_action = (
                "Urgent specialist evaluation is recommended. "
                "Consider detailed fetal imaging and multidisciplinary review."
            )
            patient_action = (
                "Please consult your doctor as soon as possible for further evaluation."
            )

        elif score >= 3:
            risk_level = "Moderate Risk"
            doctor_action = (
                "Further diagnostic evaluation and close follow-up are advised."
            )
            patient_action = (
                "We recommend discussing these findings with your doctor for further guidance."
            )

        else:
            risk_level = "Low Risk"
            doctor_action = (
                "Routine monitoring is appropriate unless new findings appear."
            )
            patient_action = (
                "At this time, the findings suggest a low likelihood. "
                "Regular prenatal check-ups are important."
            )

        # -----------------------------
        # Doctor Summary (Professional)
        # -----------------------------
        doctor_summary = (
            f"Gene: {gene}\n"
            f"Final PP4 Score: {score}\n"
            f"Risk Category: {risk_level}\n\n"
            f"Interpretation:\n"
            f"The clinical findings show a {risk_level.lower()} correlation with the gene.\n\n"
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
            "doctor_summary": doctor_summary,
            "patient_summary": patient_summary,
            "risk_level": risk_level
        }