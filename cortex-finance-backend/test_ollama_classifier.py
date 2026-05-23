import json
from app.utils.ollama_client import get_ollama_llm

llm = get_ollama_llm()

CATEGORIES = [
    "Food", "Shopping", "Travel", "Rent", "Salary", 
    "EMI", "Utilities", "Entertainment", "Subscriptions", 
    "UPI Transfers", "Others"
]

narrations = [
    "ZOMATO INTERNET",
    "AMAZON SELLER SERVICES",
    "UBER INDIA",
    "NETFLIX ENTERTAINMENT",
    "UNKNOWN TRANSFER"
]

prompt = f"""You are a financial classification assistant. Categorize each transaction description into exactly one of the following categories:
{", ".join(CATEGORIES)}

Transactions:
{json.dumps(narrations)}

Return the output as a JSON object where the keys are the exact descriptions provided, and the values are their classified categories.
Do not write any conversational intro or outro text, only return the clean JSON block.
"""

response = llm.invoke(prompt)
print("RAW RESPONSE:")
print(response)
try:
    data = json.loads(response.strip())
    print("PARSED JSON:")
    print(data)
except Exception as e:
    print("FAILED TO PARSE JSON:", e)
