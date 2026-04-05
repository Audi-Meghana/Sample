import os
import re
import logging

logger = logging.getLogger(__name__)

IS_RENDER = os.getenv("RENDER", "false").lower() == "true"

# ── Load heavy libraries only locally ──
if not IS_RENDER:
    try:
        from sentence_transformers import SentenceTransformer
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
        _transformers_available = True
    except ImportError:
        _transformers_available = False
else:
    _transformers_available = False


class NLPPhenotypeEngine:
    """
    Phenotype matcher.
    - On Render  → uses Groq API (no torch, no RAM issues)
    - On Local   → uses sentence_transformers (existing behavior)
    """

    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None

        if not IS_RENDER and _transformers_available:
            try:
                self.model = SentenceTransformer(model_name)
                print("[NLPPhenotypeEngine] Using local SentenceTransformer")
            except Exception as e:
                print(f"[NLPPhenotypeEngine] SentenceTransformer failed: {e}")
        else:
            print("[NLPPhenotypeEngine] Using Groq API for phenotype matching")

    # ── Prevent transformer from being pickled ──
    def __getstate__(self):
        state = self.__dict__.copy()
        if "model" in state:
            del state["model"]
        return state

    # ── Reload transformer after unpickling (local only) ──
    def __setstate__(self, state):
        self.__dict__.update(state)
        self.model = None
        if not IS_RENDER and _transformers_available:
            try:
                self.model = SentenceTransformer(self.model_name)
            except Exception as e:
                print(f"[NLPPhenotypeEngine] Reload failed: {e}")

    # =====================================================
    # MAIN METHOD
    # =====================================================

    def extract_from_checklist(self, text, checklist_terms, threshold=0.65):

        if not text or not checklist_terms:
            return []

        if IS_RENDER or not _transformers_available or self.model is None:
            return self._extract_with_groq(text, checklist_terms)
        else:
            return self._extract_with_transformers(text, checklist_terms, threshold)

    # =====================================================
    # GROQ-BASED MATCHING (Render)
    # =====================================================

    def _extract_with_groq(self, text, checklist_terms):
        """Use Groq LLM to identify which checklist terms are present in text."""
        try:
            from groq import Groq
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))

            terms_list = "\n".join(f"- {t}" for t in checklist_terms)

            prompt = f"""You are a medical AI assistant analyzing prenatal genetic reports.

Given the following clinical text:
\"\"\"{text[:2000]}\"\"\"

From this list of phenotype terms, identify which ones are mentioned or implied in the text above:
{terms_list}

Return ONLY a JSON array of matching terms (exact strings from the list above).
If none match, return an empty array [].
Example: ["Ventriculomegaly", "Corpus callosum agenesis"]

Return only the JSON array, nothing else."""

            response = client.chat.completions.create(
                model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.1
            )

            raw = response.choices[0].message.content.strip()

            # Parse JSON array from response
            import json
            # Find array in response
            match = re.search(r'\[.*?\]', raw, re.DOTALL)
            if match:
                detected = json.loads(match.group())
                # Only return terms that are actually in our checklist
                valid = [t for t in detected if t in checklist_terms]
                print(f"[NLPPhenotypeEngine] Groq detected {len(valid)} phenotypes")
                return valid
            return []

        except Exception as e:
            print(f"[NLPPhenotypeEngine] Groq matching failed: {e}")
            # Fallback to simple keyword matching
            return self._extract_with_keywords(text, checklist_terms)

    # =====================================================
    # SENTENCE TRANSFORMER MATCHING (Local)
    # =====================================================

    def _extract_with_transformers(self, text, checklist_terms, threshold):
        """Original sentence_transformers based matching (local only)."""
        try:
            import numpy as np

            text = text.lower()
            sentences = [s.strip() for s in text.split(".") if s.strip()]

            if not sentences:
                return []

            sentence_embeddings = self.model.encode(
                sentences, show_progress_bar=False
            )
            term_embeddings = self.model.encode(
                checklist_terms, show_progress_bar=False
            )

            detected = set()
            for sent_emb in sentence_embeddings:
                similarities = cosine_similarity([sent_emb], term_embeddings)[0]
                best_index = np.argmax(similarities)
                best_score = similarities[best_index]
                if best_score >= threshold:
                    detected.add(checklist_terms[best_index])

            return list(detected)

        except Exception as e:
            print(f"[NLPPhenotypeEngine] Transformer matching failed: {e}")
            return self._extract_with_keywords(text, checklist_terms)

    # =====================================================
    # KEYWORD FALLBACK (when everything else fails)
    # =====================================================

    def _extract_with_keywords(self, text, checklist_terms):
        """Simple keyword matching as last resort fallback."""
        text_lower = text.lower()
        detected = []
        for term in checklist_terms:
            if term.lower() in text_lower:
                detected.append(term)
        return detected