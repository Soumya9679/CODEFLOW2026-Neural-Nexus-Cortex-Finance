import requests
from langchain_community.llms import Ollama

OLLAMA_URL = "http://localhost:11434"
MODEL_NAME = "qwen2.5:1.5b"

def is_ollama_available() -> bool:
    """
    Checks if Ollama is running and has the model qwen2.5:1.5b installed.
    """
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        if response.status_code == 200:
            models = response.json().get("models", [])
            for m in models:
                if m.get("name") == MODEL_NAME or m.get("model") == MODEL_NAME:
                    return True
    except Exception:
        pass
    return False

def get_ollama_llm():
    """
    Returns an instance of Ollama LLM configured for the local model.
    """
    return Ollama(
        model=MODEL_NAME,
        base_url=OLLAMA_URL,
        temperature=0.0
    )
