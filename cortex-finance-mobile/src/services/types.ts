// Authentication API Types
export interface User {
  id: number;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Transaction API Types
export interface Transaction {
  id: number;
  user_id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  raw_text?: string;
  confidence?: number;
  created_at: string;
}

// Dashboard Stats API Types
export interface DashboardStats {
  total_balance: number;
  total_income: number;
  total_expense: number;
  savings_rate: number;
  category_totals: Record<string, number>;
  monthly_totals: Record<string, { income: number; expense: number }>;
}

// Chatbot API Types
export interface ChatMessage {
  id?: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp?: string;
}

export interface ChatResponse {
  response: string;
}

// Insights & Summary API Types
export interface InsightsResponse {
  insights: string[];
}

export interface SummaryResponse {
  summary: string;
}
