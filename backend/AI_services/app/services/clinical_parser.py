import re

def parse_clinical_text(text: str):
    findings = []
    gene = None
    anomaly_keywords = [
        "pontocerebellar hypoplasia",
        "vermian hypoplasia",
        "ventriculomegaly",
        "club foot",
        "syndactyly",
        "microcephaly",
        "holoprosencephaly"
    ]
    for keyword in anomaly_keywords:
        if keyword in text.lower():
            findings.append(keyword)
    gene_match = re.search(r"gene\s([A-Z0-9]+)", text)
    if gene_match:
        gene = gene_match.group(1)
    return {
        "phenotype": findings,
        "gene": gene
    }