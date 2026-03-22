class ReportDetector:

    @staticmethod
    def detect(text: str) -> str:
        t = " ".join(text.lower().split())

        # ─── CMA FIRST ───────────────────────────────
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
        ]):
            return "CMA"

        # ─── WES SECOND ──────────────────────────────
        # Must be before SCAN because WES reports contain
        # clinical history with scan-related words
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
            "gene, variant details",
            "variant details",
            "allele frequency",
            "sift",
            "polyphen",
        ]):
            return "WES"

        # ─── SERUM ───────────────────────────────────
        if any(k in t for k in [
            "maternal serum screen",
            "requisition form",
            "nuchal thickness",
            "serum screen",
            "papp-a",
            "free bhcg",
        ]):
            return "SERUM"

        # ─── SCAN LAST ───────────────────────────────
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
        ]):
            return "SCAN"

        # ─── Default ─────────────────────────────────
        return "WES"
    