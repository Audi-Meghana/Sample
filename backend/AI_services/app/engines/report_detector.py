import re


class ReportDetector:

    @staticmethod
    def detect(text: str, source: str = "text") -> str:
        t = " ".join(text.lower().split())

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
        ]):
            return "SERUM"

        # ─── WES FORMAL — check BEFORE SCAN ──────────────────────────────
        # Must be checked BEFORE SCAN because WES reports can mention
        # "ultrasound findings" as clinical context, which would wrongly
        # trigger the SCAN detector if SCAN was checked first.
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
        ]):
            return "WES"

        # ─── WES SPOKEN — audio/informal WES language ────────────────────
        # Whisper transcribes spoken WES reports informally.
        # Checked BEFORE SCAN because an audio WES report often says
        # "ultrasound findings include..." as supporting context —
        # that one word "ultrasound" must NOT hijack detection to SCAN.
        wes_spoken_strong = [
            # Report type — very strong signals
            "genetic report",
            "gene report",
            "prenatal genetic",
            "exome report",
            "sequencing report",
            "gene analysis",
            "genetic analysis",
            "dna report",
            "clinical report",
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
            "heterozygous",
            "homozygous",
            "de novo",
            "autosomal dominant",
            "autosomal recessive",
            "x-linked",
            "missense",
            "nonsense",
            "frameshift",
            "splice site",
            "likely benign",
            "variant of uncertain",
            "compound heterozygous",
        ]

        if any(k in t for k in wes_spoken_strong):
            return "WES"

        # ─── Gene heuristic — 2+ gene-like uppercase tokens ──────────────
        # e.g. "L1CAM", "FGFR3" appearing in audio transcript → WES
        gene_like = re.findall(r'\b[A-Z]{2,8}\d*\b', text)
        non_gene = {
            "NT", "BPD", "FHR", "CRL", "EFW", "MOM", "DNA", "RNA",
            "PCR", "IVF", "IVP", "LMP", "EDD", "OB", "GYN", "US",
            "CT", "MRI", "ECG", "EKG", "NICU", "ICU", "ER", "IV",
            "OK", "NA", "PM", "AM", "ID", "NO", "YES",
            "SCAN", "CMA", "WES", "VUS", "HPO", "ACMG",
            "AND", "THE", "FOR", "WITH", "FROM", "INTO",
        }
        gene_candidates = [g for g in gene_like if g not in non_gene and len(g) >= 3]
        if len(gene_candidates) >= 2:
            print(f"DEBUG ReportDetector: gene heuristic matched {gene_candidates[:5]} → WES")
            return "WES"

        # ─── SCAN — checked AFTER all WES checks ─────────────────────────
        # Only reaches here if absolutely no WES indicators found.
        if any(k in t for k in [
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
        ]):
            return "SCAN"

        # ─── Final default ────────────────────────────────────────────────
        # For audio/video with no keywords, default to SCAN but log it
        # This is better than guessing — the user can manually correct if needed
        if source in ("audio", "video"):
            print(f"DEBUG ReportDetector: no keywords matched for {source} — defaulting SCAN")
            print(f"DEBUG ReportDetector: transcript was: {text[:100]}")
            return "SCAN"

        return "WES"