// Authentication API Types
export interface User {
  id: number;
  email: string;
  full_name: string | null;
  name?: string;
  created_at: string;
}

export interface AuthResponse {
  token?: string;
  access_token?: string;
  token_type?: string;
  user: User;
}

// Transaction API Types
export interface Transaction {
  id?: number;
  date: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
  category: string;
  is_recurring: number;
  is_anomaly: number;
  filename: string;
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

export interface DashboardAnomaly {
  narration: string;
  date: string;
  category: string;
  amount: number;
}

export interface DashboardRecurringPayment {
  narration: string;
  category: string;
  amount: number;
}

export interface DashboardData {
  income: number;
  expense: number;
  score: number;
  savings_rate: number;
  monthly_trend: Record<string, { income: number; expense: number }>;
  categories: Record<string, number>;
  anomalies?: DashboardAnomaly[];
  recurring_payments?: DashboardRecurringPayment[];
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
