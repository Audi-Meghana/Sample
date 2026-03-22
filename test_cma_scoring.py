#!/usr/bin/env python3
"""
Quick test of CMA scoring logic
"""

# Test data from screenshot
test_data = {
    "cnv_result": "normal",
    "consanguinity": "no",
    "microdeletions": "none",
    "roh": "detected",
    "cardiac_findings": ["cardiac finding"],
    "aneuploidy": {}
}

# Scoring weights
CMA_WEIGHTS = {
    "cnv_abnormal": 4.0,
    "trisomy": 4.0,
    "consanguinity": 2.0,
    "cardiac_finding": 3.0,
    "microdeletion": 3.0,
    "roh_detected": 2.0,
}

raw_score = 0.0
factors = []

cnv_result = str(test_data.get("cnv_result", "") or "").lower()
consanguinity = str(test_data.get("consanguinity", "") or "").lower()
microdeletions = str(test_data.get("microdeletions", "") or "").lower()
roh = str(test_data.get("roh", "") or "").lower()
aneuploidy = test_data.get("aneuploidy", {}) or {}
cardiac = test_data.get("cardiac_findings", []) or []

print(f"Parsed fields:")
print(f"  cnv_result: '{cnv_result}'")
print(f"  consanguinity: '{consanguinity}'")
print(f"  microdeletions: '{microdeletions}'")
print(f"  roh: '{roh}'")
print(f"  cardiac: {cardiac}")
print(f"  aneuploidy: {aneuploidy}")
print()

# CNV Abnormal
print(f"Checking CNV: 'abnormal' in '{cnv_result}' = {'abnormal' in cnv_result}")
if "abnormal" in cnv_result:
    raw_score += CMA_WEIGHTS["cnv_abnormal"]
    factors.append("CNV Abnormal detected (+4.0)")
    print(f"  ✓ Added 4.0")

# Trisomy
print(f"Checking aneuploidy: {aneuploidy}")
for k, v in aneuploidy.items():
    if str(v).lower() == "positive":
        raw_score += CMA_WEIGHTS["trisomy"]
        factors.append(f"Aneuploidy positive: {k} (+4.0)")
        print(f"  ✓ Added 4.0 for {k}")

# Consanguinity
print(f"Checking consanguinity: 'yes' in '{consanguinity}' = {'yes' in consanguinity}")
if "yes" in consanguinity:
    raw_score += CMA_WEIGHTS["consanguinity"]
    factors.append("Consanguineous marriage (+2.0)")
    print(f"  ✓ Added 2.0")

# Cardiac findings
print(f"Checking cardiac: cardiac={cardiac}, len={len(cardiac) if cardiac else 0}")
if cardiac and len(cardiac) > 0:
    cardiac_str = str(cardiac).lower()
    print(f"  cardiac_str: '{cardiac_str}'")
    print(f"  NOT in ('none', 'null', '[]', ''): {cardiac_str not in ('none', 'null', '[]', '')}")
    if cardiac_str not in ("none", "null", "[]", ""):
        raw_score += CMA_WEIGHTS["cardiac_finding"]
        factors.append(f"Cardiac findings detected (+3.0)")
        print(f"  ✓ Added 3.0")

# Microdeletions
print(f"Checking microdeletions: '{microdeletions}'")
print(f"  'negative' NOT in '{microdeletions}': {'negative' not in microdeletions}")
print(f"  '{microdeletions}' NOT in ('', 'null', 'none'): {microdeletions not in ('', 'null', 'none')}")
if "negative" not in microdeletions and microdeletions not in ("", "null", "none"):
    raw_score += CMA_WEIGHTS["microdeletion"]
    factors.append("Microdeletion detected (+3.0)")
    print(f"  ✓ Added 3.0")

# ROH
print(f"Checking ROH: '{roh}'")
print(f"  NOT in ('none', 'null', '', 'no significant'): {roh not in ('none', 'null', '', 'no significant')}")
if roh not in ("none", "null", "", "no significant"):
    raw_score += CMA_WEIGHTS["roh_detected"]
    factors.append("Regions of Homozygosity detected (+2.0)")
    print(f"  ✓ Added 2.0")

print()
print(f"FINAL RESULT:")
print(f"  Raw Score: {raw_score}")
print(f"  Factors: {factors}")
print(f"  Expected: 5.0 (Moderate Risk)")
