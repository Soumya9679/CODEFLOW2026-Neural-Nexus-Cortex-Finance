import os
import google.generativeai as genai
from app.rag.retriever import retrieve_context
from app.ai.gemini_classifier import api_key
from app.utils.ollama_client import is_ollama_available, get_ollama_llm

if api_key:
    genai.configure(api_key=api_key)

def ask_question(query: str, chat_history: list = None) -> str:
    context = retrieve_context(query, k=15)
    
    history_context = ""
    if chat_history:
        history_context = "Conversation History:\n"
        for msg in chat_history[-6:]:  # Keep last 3 turns
            role = "User" if msg.get("sender") == "user" else "Assistant"
            text = msg.get("text", "")
            history_context += f"{role}: {text}\n"
        history_context += "\n"

    def get_fallback_response():
        fallback_msg = (
            "⚠️ **AI Assistant unavailable.** Here is a list of relevant transactions matching your query:\n\n"
        )
        if "No transaction history" in context or "No matching transactions" in context:
            return fallback_msg + "*No matching transactions found in your statement.*"
        
        for line in context.split("\n"):
            fallback_msg += f"- {line}\n"
        return fallback_msg

    if is_ollama_available():
        print("INFO: Local Ollama (qwen2.5:1.5b) is running. Using Ollama for chatbot query.")
        try:
            llm = get_ollama_llm()
            prompt = f"""You are Cortex AI, a highly intelligent financial assistant for Cortex Finance.
Your task is to answer user queries about their bank statement transactions using the retrieved context below.

{history_context}
Retrieved Bank Transaction Context:
\"\"\"
{context}
\"\"\"

User Question: "{query}"

Instructions:
- Provide a direct, clear, and professional response.
- Use markdown tables, bolding, or lists for financial statistics or breakdowns.
- Cite specific dates and amounts from the context.
- If no transactions are found or context is empty, politely inform the user that you couldn't find any relevant transactions.
"""
            response = llm.invoke(prompt)
            return response.strip()
        except Exception as e:
            print(f"Error using local Ollama for chatbot: {e}. Falling back to Gemini.")

    if not api_key:
        return get_fallback_response()

    try:
        print("INFO: Local Ollama not available or failed. Falling back to Gemini for chatbot.")
        prompt = f"""
You are Cortex AI, a highly intelligent financial assistant for Cortex Finance.
Your task is to answer user queries about their bank statement transactions using the retrieved context below.

{history_context}
Retrieved Bank Transaction Context:
\"\"\"
{context}
\"\"\"

User Question: "{query}"

Instructions:
- Provide a direct, clear, and professional response.
- Use markdown tables, bolding, or lists for financial statistics or breakdowns.
- Cite specific dates and amounts from the context.
- If no transactions are found or context is empty, politely inform the user that you couldn't find any relevant transactions.
"""
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        print(f"Error calling Gemini in chatbot: {e}")
        return get_fallback_response()