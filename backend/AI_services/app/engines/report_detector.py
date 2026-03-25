import re


class ReportDetector:

    @staticmethod
    def detect(text: str, source: str = "text") -> str:
        t = " ".join(text.lower().split())

        # ─── STRONG WES SIGNAL: Gene variant notation ─────────────────────
        # If we see NM_ accessions + HGVS notation, it's definitely WES
        # This must be checked BEFORE CMA to avoid false positives
        has_nm_accession = bool(re.search(r'nm_\d{6}', t))
        has_hgvs_notation = bool(re.search(r'[cp]\.\d+[a-z>]+', t))
        has_variant_keywords = any(k in t for k in [
            "variant interpretation",
            "pathogenic variant",
            "likely pathogenic",
            "uncertain significance",
            "variant classification",
            "gene variant",
            "genetic variant",
        ])
        
        # If we have NM accession + HGVS notation OR multiple variant indicators,
        # it's definitely WES (not CMA which doesn't have gene sequence info)
        if (has_nm_accession and has_hgvs_notation) or \
           (has_nm_accession and has_variant_keywords) or \
           (has_hgvs_notation and has_variant_keywords and sum([has_nm_accession, has_hgvs_notation, has_variant_keywords]) >= 2):
            print(f"DEBUG ReportDetector: strong WES signal detected (nm={has_nm_accession}, hgvs={has_hgvs_notation}, keywords={has_variant_keywords})")
            return "WES"

        # ─── CMA FIRST (always — very specific keywords) ─────────────────
        if any(k in t for k in [
            "chromosomal microarray",
            "microarray analysis",
            "copy number variation",
            "cytoscan",
            "karyoview",
            "affymetrix",
            "iscn nomenclature",
            "no significant copy number",
            "regions of homozygosity",
            "750k",
            "mgm1618",
            "cnvs:",
            "copy number variants",
            "cnv result",
        ]):
            return "CMA"

        # ─── SERUM (very specific keywords) ──────────────────────────────
        if any(k in t for k in [
            "maternal serum screen",
            "requisition form",
            "nuchal thickness",
            "serum screen",
            "papp-a",
            "free bhcg",
            "triple screen",
            "quad screen",
            "first trimester screening",
            "biochemical markers",
            "serum screening",
            "biochemical screening",
            "serum markers",
            "maternal serum",
            "serology",
            "risk assessment",
            "aneuploidy risk",
            "trisomy risk",
            "prenatal screening",
            "screening risk",
            "screen result",
            "high risk",
            "low risk",
            "likelihood ratio",
            "risk of",
            "fetal risk",
        ]):
            return "SERUM"

        # ✅ FIX: CHECK SCAN KEYWORDS FIRST (before generic WES keywords)
        # This prevents SCAN reports with phrases like "clinical report"
        # from being incorrectly detected as WES
        scan_keywords = [
            "ultrasound",
            "fetal biometry",
            "fetal heart rate",
            "tiffa",
            "fetal anatomy",
            "trimester scan",
            "transabdominal",
            "anomaly scan",
            "crown rump length",
            "bpd",
            "fhr",
            "nt measurement",
            "nasal bone",
            "doppler flow",
            "tricuspid valve",
            "ductus venosus",
            "fetal measurements",
            "amniotic fluid",
            "prenatal ultrasound",
            "obstetric ultrasound",
            "obstetric scan",
            "obstetric biometry",
            "pregnancy ultrasound",
            "fetal ultrasound",
            "prenatal scan",
            "b-mode",
            "scanning",
            "sonogram",
            "gestational sac",
            "heart rate",
            "embryo",
            "fetal pole",
            "abort",
            "scan report",
            "ultrasound report",
            "biometry report",
            "anatomy scan",
            "mid-trimester",
            "second trimester",
            "cardiovascular",
            "cardiac screening",
        ]
        if any(k in t for k in scan_keywords):
            return "SCAN"

        # ─── WES FORMAL — checked AFTER SCAN ─────────────────────────────
        # Now that SCAN is checked first, we can safely check generic WES keywords
        # without them hijacking SCAN reports that happen to mention common phrases
        if any(k in t for k in [
            "whole exome sequencing",
            "exome sequencing",
            "dna test report",
            "variant interpretation",
            "pathogenic variant",
            "likely pathogenic",
            "uncertain significance",
            "zygosity",
            "hgvs",
            "nm_00",
            "col12a1",
            "brca",
            "cftr",
            "clinvar",
            "gnomad",
            "acmg",
            "vus",
            "variant details",
            "allele frequency",
            "sift",
            "polyphen",
            "heterozygous",
            "homozygous",
            "autosomal",
            "x-linked",
            "inheritance",
            "genetic disorder",
            "omim",
            "variant classification",
            "in silico",
            "maf",
            "minor allele",
            "missense",
            "nonsense",
            "frameshift",
            "splice",
            "damage",
            "benign",
        ]):
            return "WES"

        # ─── WES SPOKEN — audio/informal WES language ────────────────────
        # Whisper transcribes spoken WES reports informally.
        # Checked AFTER SCAN because SCAN reports won't have strong genetic language
        wes_spoken_strong = [
            # Report type — very strong signals (but not too generic)
            "genetic report",
            "gene report",
            "prenatal genetic",
            "exome report",
            "sequencing report",
            "gene analysis",
            "genetic analysis",
            "dna report",
            "diagnosis",
            "pathogenic",

            # Gene identification phrases — strong signals
            "gene identified",
            "gene detected",
            "gene found",
            "mutation identified",
            "mutation detected",
            "mutation found",
            "variant identified",
            "variant detected",
            "variant found",
            "gene name",
            "pathogenic variant",
            "likely pathogenic",

            # Variant notation — very strong signals
            "variant c.",        # c.1234A>G style
            "variant p.",        # p.Arg123 style
            "c dot",             # raw Whisper: "C dot 1234"
            "greater than",      # raw Whisper: "C dot 1234 A greater than G"

            # Known gene names spoken aloud
            "l1cam",
            "fgfr3", "fgfr2", "fgfr1",
            "col1a1", "col1a2", "col2a1", "col4a1", "col4a3",
            "pkhd1", "pkd1", "pkd2",
            "tsc1", "tsc2",
            "smad4", "smad2",
            "men1", "men2",
            "vhl gene",
            "apc gene",
            "nf1 gene", "nf2 gene",
            "brca",
            "cftr",
            "tp53",

            # Inheritance / variant type — strong WES context
            "de novo",
            "autosomal dominant",
            "autosomal recessive",
            "x-linked",
            "splice site",
            "likely benign",
            "variant of uncertain",
            "compound heterozygous",
        ]

        if any(k in t for k in wes_spoken_strong):
            return "WES"

        # ─── Gene details strong spoken clue ────────────────────────────
        if "gene details" in t or "gene detail" in t:
            return "WES"

        # ─── Gene heuristic — gene-like uppercase+digit tokens ──────────────
        # e.g. "L1CAM", "FGFR3", "11CAM" appearing in audio transcript → WES
        # Note: 11CAM can appear from speech normalization edge case
        t_upper = text.upper()
        gene_like = re.findall(r'\b(?:[A-Z]*\d+[A-Z]+|[A-Z]+\d+[A-Z]*)\b', t_upper)
        non_gene = {
            # Medical abbreviations
            "NT", "BPD", "FHR", "CRL", "EFW", "MOM", "DNA", "RNA",
            "PCR", "IVF", "IVP", "LMP", "EDD", "OB", "GYN", "US",
            "CT", "MRI", "ECG", "EKG", "NICU", "ICU", "ER", "IV",
            "OK", "NA", "PM", "AM", "ID", "NO", "YES",
            "SCAN", "CMA", "WES", "VUS", "HPO", "ACMG",
            "AND", "THE", "FOR", "WITH", "FROM", "INTO",
            # Report types
            "RES", "REPORT", "PDF", "FILE", "FORM",
            # Common names/words that look like genes
            "BABU", "MADHAN", "SANDHYA", "VINOTH", "PRIYA", "ARUN",
            "HOSPITAL", "CLINIC", "CENTER", "CENTRE", "OFFICE", "DEPT",
            "MEDICAL", "HEALTH", "CARE", "LABS", "INSTITUTE",
            "PATIENT", "DATE", "TIME", "SCAN", "TEST", "REPORT",
            "RESULT", "NORMAL", "ABNORMAL", "POSITIVE", "NEGATIVE",
            "PROCEDURE", "ANALYSIS", "SECTION", "DEPARTMENT",
            "PHONE", "EMAIL", "ADDRESS", "STREET", "SQUARE",
            "BLOCK", "LANE", "ROAD", "PLACE", "HOUSE",
            "MRS", "MR", "MS", "DR", "PROF", "DR",
            # More exclusions to be safe
            "OBSTETRIC", "GYNECOLOGY", "MATERNAL", "FETAL",
            "WEEK", "WEEKS", "MONTH", "MONTHS", "YEAR", "YEARS",
            "MALE", "FEMALE", "BABY", "INFANT", "CHILD",
        }
        
        # Strict gene filtering:
        # 1. Must NOT be in the exclusion list
        # 2. Must be at least 4 chars (most real genes are longer than 3)
        # 3. Should contain at least one digit (real genes often have numbers)
        gene_candidates = [
            g for g in gene_like 
            if g not in non_gene 
            and len(g) >= 4 
            and any(c.isdigit() for c in g)  # Must have at least one digit
        ]
        
        # Trigger WES for strong gene candidates
        if len(gene_candidates) >= 2:
            print(f"DEBUG ReportDetector: gene heuristic matched {gene_candidates[:5]} → WES")
            return "WES"

        # Also allow single strong gene if explicit gene context present
        if len(gene_candidates) == 1 and ("gene" in t or "gene details" in t):
            print(f"DEBUG ReportDetector: gene heuristic single candidate {gene_candidates} + gene context → WES")
            return "WES"

        # ─── Final default ────────────────────────────────────────────────
        # For audio/video/pdf with no clear keywords, default to SCAN
        if source in ("audio", "video", "pdf"):
            print(f"DEBUG ReportDetector: no keywords matched for {source} — defaulting SCAN")
            print(f"DEBUG ReportDetector: content preview: {text[:100]}")
            return "SCAN"

        return "WES"
