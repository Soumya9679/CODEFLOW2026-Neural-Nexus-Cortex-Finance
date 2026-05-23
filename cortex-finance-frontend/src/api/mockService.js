import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create the axios instance
export const api = axios.create({
  timeout: 10000,
});

// Setup mock adapter
let mock = new MockAdapter(api, { delayResponse: 1000 });

// --- Static Mock Data ---
const mockDashboardData = {
  totalIncome: 85000,
  totalExpenses: 24532,
  healthStatus: "Good",
  savingsRate: 35,
  categoryBreakdown: [
    { name: 'Food', value: 35 },
    { name: 'Rent', value: 40 },
    { name: 'Travel', value: 10 },
    { name: 'Shopping', value: 15 },
  ]
};

const mockTransactionsData = [
  { id: 1, type: 'Expense', category: 'Food', asset: 'Swiggy', amount: '-', value: '₹450.00', status: 'Completed', date: '2026-05-23' },
  { id: 2, type: 'Expense', category: 'Rent', asset: 'Landlord Transfer', amount: '-', value: '₹15,000.00', status: 'Completed', date: '2026-05-22' },
  { id: 3, type: 'Income', category: 'Salary', asset: 'Tech Corp Ltd', amount: '+', value: '₹85,000.00', status: 'Completed', date: '2026-05-01' },
  { id: 4, type: 'Expense', category: 'Subscriptions', asset: 'Netflix', amount: '-', value: '₹649.00', status: 'Completed', date: '2026-05-20' },
];

const mockInsightsData = {
  overspending: {
    category: "Food/Dining",
    percentage: 40,
    message: "You spent 40% more on Food/Dining this weekend compared to last month.",
    items: [
      { name: "Swiggy Delivery", amount: 1250, date: "Sat, 8:00 PM" },
      { name: "Starbucks", amount: 840, date: "Sun, 10:30 AM" },
      { name: "Zomato", amount: 950, date: "Sun, 9:00 PM" }
    ]
  },
  recurring: [
    { service: "Netflix", amount: 649 },
    { service: "Spotify", amount: 119 },
    { service: "Amazon Prime", amount: 299 }
  ],
  totalRecurring: 1067
};

// Setup Mock Endpoints
const setupMocks = () => {
  mock.reset();

  mock.onPost('/upload').reply(200, {
    message: "Bank statement successfully uploaded and analyzed.",
    status: "success"
  });

  mock.onGet('/dashboard').reply(200, mockDashboardData);
  mock.onGet('/transactions').reply(200, { transactions: mockTransactionsData });
  mock.onGet('/insights').reply(200, mockInsightsData);

  mock.onPost('/chat').reply(config => {
    const { message } = JSON.parse(config.data);
    const q = message.toLowerCase();
    let aiResponse = "I can help you analyze your finances using AI. Try asking me about your spending patterns or subscriptions!";
    
    if (q.includes('spending') || q.includes('expenses')) {
      aiResponse = "### 📊 Spending Analysis\nYou spent **₹24,532** last week.\n\nHere is your top spending breakdown:\n1. **Rent**: 40%\n2. **Food/Dining**: 35%\n3. **Shopping**: 15%\n\n> *AI Tip: To save more, consider reducing food delivery frequency.*";
    } else if (q.includes('subscriptions') || q.includes('recurring')) {
      aiResponse = "I found **3 active subscriptions** in your statement:\n\n| Service | Amount |\n| --- | --- |\n| Netflix | ₹649 |\n| Spotify | ₹119 |\n| Amazon Prime | ₹299 |\n\n**Total:** ₹1,067/month.";
    } else if (q.includes('unusual')) {
      aiResponse = "⚠️ **Alert:** There is one unusual transaction detected:\n\n- **Swiggy (₹450)** today. \n\nThis is **40% higher** than your average weekday food delivery order.";
    }
    
    return [200, { reply: aiResponse }];
  });
};

// Response Adaptation Mappers
const adaptDashboardData = (raw) => {
  if (!raw) return mockDashboardData;
  return {
    totalIncome: raw.income || 0,
    totalExpenses: raw.expense || 0,
    savingsRate: raw.savings_rate || 0,
    healthStatus: (raw.score >= 80) ? "Excellent" : (raw.score >= 60) ? "Good" : "Needs Attention",
    categoryBreakdown: Object.entries(raw.categories || {}).map(([name, value]) => ({ name, value }))
  };
};

const adaptTransactionsData = (rawTxs) => {
  if (!rawTxs || !rawTxs.length) return mockTransactionsData;
  return rawTxs.map(tx => {
    const isExpense = tx.debit > 0;
    const value = isExpense ? tx.debit : tx.credit;
    return {
      id: tx.id,
      type: isExpense ? 'Expense' : 'Income',
      category: tx.category || 'Others',
      asset: tx.narration,
      amount: isExpense ? '-' : '+',
      value: `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: 'Completed',
      date: tx.date
    };
  });
};

const adaptInsightsData = (rawDash) => {
  if (!rawDash) return mockInsightsData;
  const anomalies = rawDash.anomalies || [];
  const recurring = rawDash.recurring_payments || [];
  
  const recurringFormatted = recurring.map(item => ({
    service: item.narration || item.service || 'Subscription',
    amount: item.amount || item.debit || 0
  }));

  const totalRecurring = recurringFormatted.reduce((acc, curr) => acc + curr.amount, 0);

  const anomalyItems = anomalies.map(item => ({
    name: item.narration || 'Unusual Transaction',
    amount: item.amount || item.debit || 0,
    date: item.date
  }));

  const overspendingMessage = anomalies.length > 0 
    ? `We detected ${anomalies.length} anomalous transactions that significantly exceed your normal spending habits.`
    : "No unusual spending or anomalous transactions detected in this statement.";

  return {
    overspending: {
      category: anomalies.length > 0 ? (anomalies[0].category || "Dining") : "Dining",
      percentage: anomalies.length > 0 ? 40 : 0,
      message: overspendingMessage,
      items: anomalyItems
    },
    recurring: recurringFormatted,
    totalRecurring: totalRecurring
  };
};

// Dynamic Mode Configuration
export const configureApi = () => {
  const mode = localStorage.getItem('cortex_api_mode') || 'mock';
  
  if (mode === 'live') {
    api.defaults.baseURL = 'http://localhost:8000';
    mock.restore(); // Disable mockup interception
  } else {
    api.defaults.baseURL = 'https://api.cortexfinance.com/v1';
    setupMocks();
  }
};

// Intercept requests to adapt responses in live mode
api.interceptors.response.use(
  (response) => {
    const mode = localStorage.getItem('cortex_api_mode') || 'mock';
    if (mode === 'live') {
      const url = response.config.url.replace(response.config.baseURL, '').split('?')[0];
      
      if (url === '/dashboard') {
        window.__lastRawDashboard = response.data;
        response.data = adaptDashboardData(response.data);
      } else if (url === '/transactions') {
        response.data = { transactions: adaptTransactionsData(response.data.transactions) };
      } else if (url === '/insights') {
        const rawDashboard = window.__lastRawDashboard; 
        response.data = adaptInsightsData(rawDashboard);
      } else if (url === '/chat') {
        response.data = { reply: response.data.response || response.data.reply };
      }
    }
    return response;
  },
  async (error) => {
    const mode = localStorage.getItem('cortex_api_mode') || 'mock';
    if (mode === 'live') {
      console.warn("FastAPI backend request failed, falling back to mock:", error.message);
      const url = error.config.url.replace(error.config.baseURL, '').split('?')[0];
      
      if (url === '/dashboard') {
        return { data: mockDashboardData };
      } else if (url === '/transactions') {
        return { data: { transactions: mockTransactionsData } };
      } else if (url === '/insights') {
        return { data: mockInsightsData };
      } else if (url === '/chat') {
        return { data: { reply: "I couldn't connect to the local RAG assistant. Here is a simulated response:\n\nBased on your mock statement, you spent ₹24,532 last month, with rent and dining being your largest expense categories." } };
      }
    }
    return Promise.reject(error);
  }
);

// Intercept request in live mode to adapt chat payload structure
api.interceptors.request.use(
  (config) => {
    const mode = localStorage.getItem('cortex_api_mode') || 'mock';
    if (mode === 'live') {
      const url = config.url.replace(config.baseURL, '').split('?')[0];
      if (url === '/chat' && config.data) {
        // Translate fronted { message } to backend { query }
        try {
          const parsed = JSON.parse(config.data);
          if (parsed.message) {
            config.data = JSON.stringify({ query: parsed.message });
          }
        } catch (e) {
          if (config.data.message) {
            config.data = { query: config.data.message };
          }
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Initialize configuration
configureApi();

// Listen to local storage switches to instantly reconfigure
window.addEventListener('storage', () => {
  configureApi();
});

export default api;
