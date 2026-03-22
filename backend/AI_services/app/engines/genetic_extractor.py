import logging
import json
import re
import time
import os
import requests
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class GeneticExtractor:

    def __init__(self, kb_data=None, clinvar_df=None):
        self._valid_genes = set()

        if kb_data:
            for key in kb_data.keys():
                g = str(key).upper().strip()
                if g:
                    self._valid_genes.add(g)

        if clinvar_df is not None and "GeneSymbol" in clinvar_df.columns:
            for symbol in clinvar_df["GeneSymbol"].dropna().unique():
                for part in str(symbol).split("|"):
                    g = part.strip().upper()
                    if g:
                        self._valid_genes.add(g)

        logger.info(f"GeneticExtractor loaded {len(self._valid_genes)} valid genes")

        # ✅ Pick provider from .env
        self.provider = os.getenv("LLM_PROVIDER", "groq").lower()

        if self.provider == "gemini":
            from google import genai
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("❌ GEMINI_API_KEY not found in .env")
            self.gemini_client = genai.Client(api_key=api_key)
            self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

        elif self.provider == "groq":
            self.groq_api_key = os.getenv("GROQ_API_KEY")
            if not self.groq_api_key:
                raise ValueError("❌ GROQ_API_KEY not found in .env")
            self.model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

        elif self.provider == "openrouter":
            self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
            if not self.openrouter_api_key:
                raise ValueError("❌ OPENROUTER_API_KEY not found in .env")
            self.model_name = os.getenv("OPENROUTER_MODEL", "mistralai/mistral-7b-instruct:free")

        else:
            raise ValueError(f"❌ Unknown LLM_PROVIDER: {self.provider}. Use: gemini, groq, openrouter")

        logger.info(f"✅ GeneticExtractor using provider: {self.provider} | model: {self.model_name}")

    # -------------------------------------------------
    # JSON parser
    # -------------------------------------------------

    def _parse_json_safe(self, text):
        cleaned = re.sub(r"```(?:json)?\s*", "", text).strip()
        cleaned = cleaned.replace("```", "").strip()
        return json.loads(cleaned)

    # -------------------------------------------------
    # Build prompt
    # -------------------------------------------------

    def _build_prompt(self, text):
        return f"""
You are a clinical genomics expert.

From the following prenatal or genetic report extract:
1. Gene symbol (example: COL1A2, BRCA1, CFTR, COL12A1)
2. Variant in HGVS format if present (example: c.1234A>T, p.Gly12Asp)

Return ONLY raw JSON with no markdown, no code fences, no explanation:

{{"gene": "GENE_SYMBOL", "variant": "HGVS_VARIANT_OR_NULL"}}

Rules:
- If no variant exists, return null for variant.
- If multiple genes found, return the most clinically significant one.
- Gene must be a real HGNC gene symbol in UPPERCASE.
- Never return empty string, always return UNKNOWN if not found.

Report text:
{text[:6000]}
"""

    # -------------------------------------------------
    # Groq API call
    # -------------------------------------------------

    def _call_groq(self, prompt):
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json"
        }
        body = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "max_tokens": 200
        }
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=body,
            timeout=30
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()

    # -------------------------------------------------
    # OpenRouter API call
    # -------------------------------------------------

    def _call_openrouter(self, prompt):
        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json"
        }
        body = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "max_tokens": 200
        }
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=body,
            timeout=30
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()

    # -------------------------------------------------
    # Gemini API call
    # -------------------------------------------------

    def _call_gemini(self, prompt):
        from google.genai import types
        response = self.gemini_client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.1)
        )
        return response.text.strip()

    # -------------------------------------------------
    # Regex fallback
    # -------------------------------------------------

    def _extract_gene_variant_regex(self, text: str):
        gene = "UNKNOWN"
        context_pattern = r'(?:gene|variant in|mutation in|pathogenic variant|locus)[:\s]+([A-Z][A-Z0-9]{1,9})\b'
        context_match = re.search(context_pattern, text, re.IGNORECASE)
        if context_match:
            candidate = context_match.group(1).upper()
            if not self._valid_genes or candidate in self._valid_genes:
                gene = candidate

        if gene == "UNKNOWN" and self._valid_genes:
            for match in re.finditer(r'\b([A-Z][A-Z0-9]{1,9})\b', text):
                candidate = match.group(1).upper()
                if candidate in self._valid_genes:
                    gene = candidate
                    break

        variant = None
        variant_match = re.search(r'\b([cgpm]\.[A-Za-z0-9_>*+\-{}[\]()]+)\b', text)
        if variant_match:
            variant = variant_match.group(1)

        logger.info(f"🔄 Regex fallback — gene: {gene}, variant: {variant}")
        return gene, variant

    # -------------------------------------------------
    # Main extraction with retry + fallback
    # -------------------------------------------------

    def _extract_gene_variant_gemini(self, text):
        prompt = self._build_prompt(text)
        max_retries = 3
        retry_delays = [20, 40, 60]

        for attempt in range(max_retries):
            try:
                # Call correct provider
                if self.provider == "groq":
                    raw = self._call_groq(prompt)
                elif self.provider == "openrouter":
                    raw = self._call_openrouter(prompt)
                else:
                    raw = self._call_gemini(prompt)

                logger.debug(f"LLM raw response: {raw}")
                result = self._parse_json_safe(raw)

                gene = str(result.get("gene", "UNKNOWN")).upper().strip() or "UNKNOWN"

                variant = result.get("variant")
                if variant:
                    variant = str(variant).strip()
                    if not re.match(r'^[cgpm]\.', variant):
                        logger.warning(f"Invalid HGVS format: {variant}")
                        variant = None

                logger.info(f"✅ Extracted — gene: {gene}, variant: {variant}")
                return gene, variant

            except json.JSONDecodeError as e:
                logger.error(f"JSON parse failed: {e}")
                return self._extract_gene_variant_regex(text)

            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "rate_limit" in error_str.lower():
                    if attempt < max_retries - 1:
                        wait_time = retry_delays[attempt]
                        logger.warning(f"⚠️ Rate limited (attempt {attempt + 1}/{max_retries}). Retrying in {wait_time}s...")
                        time.sleep(wait_time)
                        continue
                    else:
                        logger.warning("⚠️ All retries failed — using regex fallback.")
                        return self._extract_gene_variant_regex(text)

                logger.error(f"LLM extraction failed: {e}")
                return self._extract_gene_variant_regex(text)

        return self._extract_gene_variant_regex(text)

    # -------------------------------------------------
    # Response builder
    # -------------------------------------------------

    def _build_response(self, gene, variant):
        is_valid = gene not in ("UNKNOWN", "")
        return {
            "gene": gene,
            "variant": variant,
            "confidence": 0.95 if is_valid else 0.0,
            "status": "ok"
        }

    def extract_text(self, text: str) -> dict:
        if not text or not text.strip():
            return {"gene": "UNKNOWN", "variant": None, "confidence": 0.0, "status": "ok"}
        gene, variant = self._extract_gene_variant_gemini(text)
        return self._build_response(gene, variant)

    def extract_pdf(self, text: str) -> dict:
        if not text or not text.strip():
            return {"gene": "UNKNOWN", "variant": None, "confidence": 0.0, "status": "ok"}
        gene, variant = self._extract_gene_variant_gemini(text)
        return self._build_response(gene, variant)