import os
import json
import logging
from groq import Groq

logger = logging.getLogger(__name__)

client = None
try:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if GROQ_API_KEY:
        client = Groq(api_key=GROQ_API_KEY)
        logger.info("[LLM] Groq client initialized successfully")
    else:
        logger.info("[LLM] GROQ_API_KEY not set")
except Exception as e:
    logger.warning(f"[LLM] Groq init failed: {e}")

PROMPT = """
You are a fetal medicine AI assistant.
Input: clinical findings, ultrasound findings, biochemical findings, genetic information
Tasks:
1. Identify likely syndrome category
2. Recommend additional tests
3. Suggest targeted prenatal imaging
4. Provide clinical interpretation
Return JSON with keys: syndrome, tests, imaging, interpretation
"""

def call_llm(prompt, data):
    if not client:
        return {"error": "LLM not available"}
    try:
        content = f"{prompt}\nData: {json.dumps(data)}"
        message = client.messages.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1000,
            messages=[{"role": "user", "content": content}]
        )
        response_text = message.content[0].text
        return json.loads(response_text)
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        return {"error": str(e)}

def analyze_case(data):
    response = call_llm(PROMPT, data)
    return response