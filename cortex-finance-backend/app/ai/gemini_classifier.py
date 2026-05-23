import os
import json
import google.generativeai as genai
from app.utils.ollama_client import is_ollama_available, get_ollama_llm

def load_env_fallback():
    """Manually reads .env variables if python-dotenv is not installed."""
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        # Search parent directories for .env
        for path in [".env", "../.env", "../../.env", "../../../.env"]:
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if "=" in line and not line.startswith("#"):
                            key, val = line.split("=", 1)
                            os.environ[key.strip()] = val.strip().strip('"').strip("'")
                break

# Load env variables on module import
load_env_fallback()

# Fetch and configure Gemini API Key
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

CATEGORIES = [
    "Food", "Shopping", "Travel", "Rent", "Salary", 
    "EMI", "Utilities", "Entertainment", "Subscriptions", 
    "UPI Transfers", "Others"
]

def clean_json_response(text: str) -> str:
    """Strips markdown code blocks and retrieves valid JSON content."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1:
        text = text[first_brace:last_brace+1]
    return text

def classify_transactions_gemini(narrations: list) -> dict:
    """
    Classifies a list of transaction narrations into categories.
    Prioritizes local Ollama (qwen2.5:1.5b) if available; otherwise falls back to Gemini API.
    If both fail or are missing, defaults to 'Others'.
    """
    if not narrations:
        return {}

    unique_narrations = list(set(narrations))
    results = {narration: "Others" for narration in unique_narrations}

    # 1. Try Local Ollama (qwen2.5:1.5b)
    if is_ollama_available():
        print("INFO: Local Ollama (qwen2.5:1.5b) is running. Using Ollama for transaction classification.")
        try:
            llm = get_ollama_llm()
            narrations_str = json.dumps(unique_narrations)
            prompt = f"""You are a financial classification assistant. Categorize each transaction description into exactly one of the following categories:
{", ".join(CATEGORIES)}

Transactions:
{narrations_str}

Return the output as a JSON object where the keys are the exact descriptions provided, and the values are their classified categories.
Do not write any conversational intro or outro text, only return the clean JSON block.
"""
            response = llm.invoke(prompt)
            cleaned = clean_json_response(response)
            parsed_results = json.loads(cleaned)
            
            for narration in unique_narrations:
                category = parsed_results.get(narration, "Others")
                if category in CATEGORIES:
                    results[narration] = category
                else:
                    results[narration] = "Others"
            return results
        except Exception as e:
            print(f"Error using local Ollama classifier: {e}. Falling back to Gemini.")

    # 2. Fall back to Gemini API
    if not api_key:
        print("Warning: Local Ollama not available and GEMINI_API_KEY missing. Defaulting to 'Others'.")
        return results

    try:
        print("INFO: Local Ollama not available or failed. Falling back to Gemini API.")
        narrations_str = json.dumps(unique_narrations)
        prompt = f"""
You are a financial classification assistant. Your task is to categorize transaction descriptions (narrations) from Indian bank statements.
Classify each description into exactly one of the following categories:
- {', '.join(CATEGORIES)}

Here is the list of transaction descriptions:
{narrations_str}

Return the output as a JSON object where the keys are the exact descriptions provided, and the values are their classified categories.
Example output format:
{{
  "UPI/Zomato/123": "Food",
  "Amazon Pay Balance": "Shopping"
}}
Do not write any conversational intro or outro text, only return the clean JSON block.
"""
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        parsed_results = json.loads(response.text.strip())
        for narration in unique_narrations:
            category = parsed_results.get(narration, "Others")
            if category in CATEGORIES:
                results[narration] = category
            else:
                results[narration] = "Others"
                
    except Exception as e:
        print(f"Error in Gemini classification: {e}. Falling back to default 'Others'.")
        pass

    return results
