# Cortex Finance AI 💰🤖

An AI-powered bank statement analyzer built for hackathons, simplifying personal finance using Retrieval-Augmented Generation (RAG).

Cortex Finance AI automatically extracts transaction data from Indian bank statements (PDF/CSV), categorizes expenses, detects recurring payments & anomalies, and provides conversational financial intelligence through an interactive RAG chatbot.

---

## 🚀 Key Features

*   **Statement Processing:** Securely upload and parse semi-structured Indian bank statements (PDF/CSV).
*   **AI-Powered Analytics:** Categorize expenses (Food, Salary, Rent, UPI, etc.) and generate metrics (Income vs Expense, Savings, and Financial Health Score).
*   **Recurring & Anomaly Detection:** Identify recurring payments (Netflix, EMIs, SIPs) and detect unusual transaction spikes using isolation forests.
*   **RAG Financial Chatbot:** Ask questions about your spending directly in natural language (e.g., *"How much did I spend on food?"*).

---

## 🛠️ Tech Stack

*   **Frontend:** React, Tailwind CSS, Recharts, Framer Motion
*   **Backend:** FastAPI, Python, SQLite, pdfplumber
*   **AI/ML & RAG:** LangChain, Gemini API, FAISS, Sentence Transformers, Scikit-learn

---

## 🏗️ Architecture

```text
Frontend (React) ──► FastAPI Backend ──► Categorization & Analytics
                              │
                              ▼
                     RAG Pipeline (FAISS + Gemini)
```

---

## ⚙️ Quick Start

### 1. Configure Environment Variables
Create a `.env` file inside the `cortex-finance-backend` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Setup & Run Backend
```bash
cd cortex-finance-backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies and start server
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
*The interactive API documentation is available at `http://127.0.0.1:8000/docs`.*

### 3. Setup & Run Frontend
```bash
cd cortex-finance-frontend
npm install
npm start
```
*The application will run locally at `http://localhost:3000`.*

---

*Built with ❤️ for Hackathon 🚀*