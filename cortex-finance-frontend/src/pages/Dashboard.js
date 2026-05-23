import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, AlertTriangle, Repeat, Zap, Loader2, Download, ArrowRight } from 'lucide-react';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';
import Settings from './Settings';
import api from '../api/mockService';

const COLORS = ['#00f0ff', '#b026ff', '#00ff88', '#ff5f56', '#facc15'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border-accentCyan/30 border shadow-xl">
        <p className="font-semibold text-white">{payload[0].name}</p>
        <p className="text-accentCyan font-medium">₹{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, txRes, insRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/transactions'),
          api.get('/insights')
        ]);

        setDashboardData(dashRes.data);
        setTransactions(txRes.data.transactions);
        setInsights(insRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const exportToCSV = () => {
    if (!transactions.length) return;
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Type', 'Status'];
    const csvRows = [headers.join(',')];

    transactions.forEach(tx => {
      const row = [`"${tx.date}"`, `"${tx.category}"`, `"${tx.asset}"`, `"${tx.value}"`, `"${tx.type}"`, `"${tx.status}"`];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'cortex_financial_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="relative">
          <Loader2 className="animate-spin text-accentCyan" size={64} />
          <div className="absolute inset-0 rounded-full blur-xl bg-accentCyan/30 animate-pulse"></div>
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-white tracking-wide">Analyzing Statements...</h2>
        <p className="text-textSecondary mt-2">Cortex AI is categorizing your transactions</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 p-8 overflow-y-auto"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold mb-1">Financial Overview</h1>
          <p className="text-textSecondary">AI-generated summary of your recent bank statement.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-accentCyan/10 text-accentCyan px-4 py-2 rounded-full border border-accentCyan/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Zap size={16} className="animate-pulse" />
            <span className="text-sm font-medium">AI Analysis Complete</span>
          </div>
          <button onClick={exportToCSV} className="btn bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-colors py-2 px-4 rounded-xl text-sm flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 ai-glow relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accentGreen/20 rounded-full blur-2xl group-hover:bg-accentGreen/40 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-textSecondary font-medium">Total Income</span>
            <div className="p-2 rounded-lg bg-accentGreen/20 text-accentGreen"><Wallet size={20} /></div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">₹{dashboardData?.totalIncome.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-accentGreen text-sm font-medium">
            <span>Primary Source: Salary</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 relative group overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accentPurple/20 rounded-full blur-2xl group-hover:bg-accentPurple/40 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-textSecondary font-medium">Total Expenses</span>
            <div className="p-2 rounded-lg bg-accentPurple/20 text-accentPurple"><TrendingUp size={20} /></div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">₹{dashboardData?.totalExpenses.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-accentPurple text-sm font-medium">
            <ArrowUpRight size={16} /> <span>High spending week</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 relative group overflow-hidden border border-accentCyan/20">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accentCyan/20 rounded-full blur-2xl group-hover:bg-accentCyan/40 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-textSecondary font-medium">Financial Health</span>
            <div className="p-2 rounded-lg bg-accentCyan/20 text-accentCyan"><Zap size={20} /></div>
          </div>
          <div className="text-3xl font-bold text-gradient mb-2">
            {dashboardData?.healthStatus} <span className="text-lg font-semibold text-textSecondary">({dashboardData?.score || 50}/100)</span>
          </div>
          <div className="flex items-center gap-1 text-accentCyan text-sm font-medium">
            <span>Savings rate: {dashboardData?.savingsRate}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-accentCyan to-accentPurple h-1.5 rounded-full" 
              style={{ width: `${dashboardData?.score || 50}%` }}
            ></div>
          </div>
        </motion.div>
      </div>

      <div className="glass-panel p-6 mb-8 border border-accentCyan/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accentCyan to-accentPurple"></div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap size={20} className="text-accentCyan" /> AI Insights & Recommendations
        </h3>

        {insights?.aiInsightsList && insights.aiInsightsList.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900/50 border border-glassBorder">
            <h4 className="font-semibold text-accentCyan text-sm mb-3 uppercase tracking-wider">Cortex AI Recommendations</h4>
            <ul className="space-y-2">
              {insights.aiInsightsList.map((recommendation, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-textSecondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-accentCyan mt-2 shrink-0"></span>
                  <span className="text-white/90">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-400 mt-1 shrink-0"><AlertTriangle size={18} /></div>
              <div>
                <h4 className="font-semibold text-white mb-1">Overspending Detected</h4>
                <p className="text-sm text-red-200/80">{insights?.overspending.message}</p>
              </div>
            </div>
            {insights?.overspending?.items && (
              <div className="mt-2 pl-14 pr-2">
                <p className="text-xs font-semibold text-red-300/70 mb-2 uppercase tracking-wider">Top Contributors</p>
                <div className="space-y-2">
                  {insights.overspending.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-red-950/30 p-2 rounded-lg border border-red-500/10">
                      <span className="text-red-100">{item.name} <span className="text-red-300/50 text-xs ml-1">({item.date})</span></span>
                      <span className="font-medium text-red-400">₹{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-accentCyan/5 border border-accentCyan/20 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-accentCyan/20 rounded-lg text-accentCyan mt-1 shrink-0"><Repeat size={18} /></div>
              <div>
                <h4 className="font-semibold text-white mb-1">Recurring Payments</h4>
                <p className="text-sm text-accentCyan/80">Identified {insights?.recurring?.length || 0} active subscriptions totaling ₹{insights?.totalRecurring}/mo.</p>
              </div>
            </div>
            {insights?.recurring && insights.recurring.length > 0 && (
              <div className="mt-2 pl-14 pr-2">
                <p className="text-xs font-semibold text-accentCyan/60 mb-2 uppercase tracking-wider">Active Subscriptions</p>
                <div className="space-y-2">
                  {insights.recurring.map((sub, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-accentCyan/10 p-2 rounded-lg border border-accentCyan/10">
                      <span className="text-cyan-50">{sub.service}</span>
                      <span className="font-medium text-accentCyan">₹{sub.amount}/mo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-panel p-6 lg:col-span-1 flex flex-col">
          <h3 className="text-xl font-bold mb-6">Expense Breakdown</h3>
          <div className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
            <div className="relative w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={1} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={dashboardData?.categoryBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {(dashboardData?.categoryBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#grad-${index % COLORS.length})`} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-6 grid grid-cols-2 gap-x-4 gap-y-3 overflow-y-auto max-h-[140px] pr-1">
              {(() => {
                const total = (dashboardData?.categoryBreakdown || []).reduce((sum, item) => sum + item.value, 0);
                return (dashboardData?.categoryBreakdown || []).map((entry, index) => {
                  const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[index % COLORS.length] }}></span>
                        <span className="text-textSecondary truncate max-w-[90px]">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="text-textSecondary text-xs">₹{entry.value.toLocaleString('en-IN')}</span>
                        <span className="text-white text-xs">{percentage}%</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Transactions</h3>
            <button className="text-accentCyan text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {transactions.map(tx => (
              <motion.div
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-xl border border-glassBorder transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${tx.type === 'Expense' ? 'bg-accentPurple/20 text-accentPurple' : 'bg-accentGreen/20 text-accentGreen'}`}>
                    {tx.type === 'Expense' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-base">{tx.asset}</div>
                    <div className="text-sm text-textSecondary">{tx.category} • {tx.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">₹{tx.value}</div>
                  <div className={`text-xs px-2 py-1 rounded-md inline-block mt-1 ${tx.type === 'Expense' ? 'bg-slate-800 text-slate-300' : 'bg-accentGreen/20 text-accentGreen'}`}>
                    {tx.type}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend and Top Merchants row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="text-xl font-bold mb-6">Income vs Expense Trend</h3>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashboardData?.monthlyTrend || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(0, 240, 255, 0.3)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="income" name="Income" fill="#00ff88" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ff5f56" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 lg:col-span-1">
          <h3 className="text-xl font-bold mb-6">Top Merchant Spending</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {(dashboardData?.merchantRankings || []).map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-glassBorder">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-white truncate max-w-[150px]">{m.merchant}</span>
                </div>
                <span className="font-bold text-accentPurple">₹{m.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
            {(!dashboardData?.merchantRankings || dashboardData.merchantRankings.length === 0) && (
              <div className="text-center text-textSecondary py-8 text-sm">
                No merchant spending data available
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  return (
    <div className="flex h-screen w-full bg-bgPrimary overflow-hidden">
      <Sidebar />
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
};

export default Dashboard;
