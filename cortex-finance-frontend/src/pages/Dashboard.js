import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, AlertTriangle, Repeat, Zap, Loader2, Download, ArrowRight } from 'lucide-react';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';
import Settings from './Settings';
import api from '../api/mockService';

const COLORS = ['#D7FF3F', '#A6FF4D', '#52A8FF', '#FFB84D', '#FF5C75'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[rgba(21,21,24,0.95)] backdrop-blur-[18px] p-3 rounded-xl border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <p className="font-semibold text-white text-sm">{payload[0].name}</p>
        <p className="text-[#D7FF3F] font-medium text-sm">₹{payload[0].value}</p>
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
          <Loader2 className="animate-spin text-[#D7FF3F]" size={64} />
          <div className="absolute inset-0 rounded-full blur-xl bg-[rgba(215,255,63,0.2)] animate-pulse"></div>
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-white tracking-wide font-outfit">Analyzing Statements...</h2>
        <p className="text-[rgba(255,255,255,0.5)] mt-2">Cortex AI is categorizing your transactions</p>
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
          <h1 className="text-4xl font-extrabold mb-1 font-outfit text-white">Financial Summary</h1>
          <p className="text-[rgba(255,255,255,0.5)]">Track your monthly activities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[rgba(215,255,63,0.08)] text-[#D7FF3F] px-4 py-2 rounded-full border border-[rgba(215,255,63,0.15)] shadow-[0_0_15px_rgba(215,255,63,0.1)]">
            <Zap size={14} className="animate-pulse" />
            <span className="text-xs font-semibold">AI Analysis Complete</span>
          </div>
          <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.65)] hover:text-white border border-[rgba(255,255,255,0.05)] transition-all duration-300">
            <Download size={15} />
            Export
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <motion.div whileHover={{ y: -4, transition: { duration: 0.3 } }} className="glass-panel p-6 relative group overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-[rgba(166,255,77,0.08)] rounded-full blur-2xl group-hover:bg-[rgba(166,255,77,0.15)] transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[rgba(255,255,255,0.5)] text-sm font-medium">Total Income</span>
            <div className="p-2 rounded-xl bg-[rgba(166,255,77,0.1)] text-[#A6FF4D]"><Wallet size={18} /></div>
          </div>
          <div className="text-3xl font-bold text-white mb-2 font-outfit">₹{dashboardData?.totalIncome.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[#A6FF4D] text-xs font-medium">
            <ArrowUpRight size={14} /><span>Primary Source: Salary</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4, transition: { duration: 0.3 } }} className="glass-panel p-6 relative group overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-[rgba(255,92,117,0.06)] rounded-full blur-2xl group-hover:bg-[rgba(255,92,117,0.12)] transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[rgba(255,255,255,0.5)] text-sm font-medium">Total Expenses</span>
            <div className="p-2 rounded-xl bg-[rgba(255,92,117,0.1)] text-[#FF5C75]"><TrendingUp size={18} /></div>
          </div>
          <div className="text-3xl font-bold text-white mb-2 font-outfit">₹{dashboardData?.totalExpenses.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[#FF5C75] text-xs font-medium">
            <ArrowUpRight size={14} /> <span>High spending week</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -4, transition: { duration: 0.3 } }} className="glass-panel p-6 relative group overflow-hidden border border-[rgba(215,255,63,0.1)]">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-[rgba(215,255,63,0.06)] rounded-full blur-2xl group-hover:bg-[rgba(215,255,63,0.12)] transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-[rgba(255,255,255,0.5)] text-sm font-medium">Financial Health</span>
            <div className="p-2 rounded-xl bg-[rgba(215,255,63,0.1)] text-[#D7FF3F]"><Zap size={18} /></div>
          </div>
          <div className="text-3xl font-bold text-gradient mb-2 font-outfit">
            {dashboardData?.healthStatus} <span className="text-base font-semibold text-[rgba(255,255,255,0.4)]">({dashboardData?.score || 50}/100)</span>
          </div>
          <div className="flex items-center gap-1 text-[#D7FF3F] text-xs font-medium">
            <span>Savings rate: {dashboardData?.savingsRate}%</span>
          </div>
          <div className="w-full bg-[rgba(255,255,255,0.06)] rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#D7FF3F] to-[#A6FF4D] h-1.5 rounded-full shadow-[0_0_8px_rgba(215,255,63,0.4)]" 
              style={{ width: `${dashboardData?.score || 50}%` }}
            ></div>
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <div className="glass-panel p-6 mb-8 border border-[rgba(215,255,63,0.08)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#D7FF3F] to-[#A6FF4D]"></div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 font-outfit">
          <Zap size={18} className="text-[#D7FF3F]" /> AI Insights & Recommendations
        </h3>

        {insights?.aiInsightsList && insights.aiInsightsList.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
            <h4 className="font-semibold text-[#D7FF3F] text-xs mb-3 uppercase tracking-widest">Cortex AI Recommendations</h4>
            <ul className="space-y-2">
              {insights.aiInsightsList.map((recommendation, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D7FF3F] mt-2 shrink-0 shadow-[0_0_6px_rgba(215,255,63,0.5)]"></span>
                  <span className="text-[rgba(255,255,255,0.75)]">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[rgba(255,92,117,0.04)] border border-[rgba(255,92,117,0.1)] rounded-xl p-5 flex flex-col gap-3">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-[rgba(255,92,117,0.12)] rounded-xl text-[#FF5C75] mt-1 shrink-0"><AlertTriangle size={18} /></div>
              <div>
                <h4 className="font-semibold text-white mb-1 text-sm">Overspending Detected</h4>
                <p className="text-xs text-[rgba(255,92,117,0.7)]">{insights?.overspending.message}</p>
              </div>
            </div>
            {insights?.overspending?.items && (
              <div className="mt-2 pl-14 pr-2">
                <p className="text-[10px] font-semibold text-[rgba(255,92,117,0.5)] mb-2 uppercase tracking-widest">Top Contributors</p>
                <div className="space-y-2">
                  {insights.overspending.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-[rgba(255,92,117,0.06)] p-2.5 rounded-lg border border-[rgba(255,92,117,0.08)]">
                      <span className="text-[rgba(255,255,255,0.7)]">{item.name} <span className="text-[rgba(255,255,255,0.3)] ml-1">({item.date})</span></span>
                      <span className="font-semibold text-[#FF5C75]">₹{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-[rgba(215,255,63,0.03)] border border-[rgba(215,255,63,0.08)] rounded-xl p-5 flex flex-col gap-3">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-[rgba(215,255,63,0.1)] rounded-xl text-[#D7FF3F] mt-1 shrink-0"><Repeat size={18} /></div>
              <div>
                <h4 className="font-semibold text-white mb-1 text-sm">Recurring Payments</h4>
                <p className="text-xs text-[rgba(215,255,63,0.6)]">Identified {insights?.recurring?.length || 0} active subscriptions totaling ₹{insights?.totalRecurring}/mo.</p>
              </div>
            </div>
            {insights?.recurring && insights.recurring.length > 0 && (
              <div className="mt-2 pl-14 pr-2">
                <p className="text-[10px] font-semibold text-[rgba(215,255,63,0.4)] mb-2 uppercase tracking-widest">Active Subscriptions</p>
                <div className="space-y-2">
                  {insights.recurring.map((sub, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-[rgba(215,255,63,0.05)] p-2.5 rounded-lg border border-[rgba(215,255,63,0.06)]">
                      <span className="text-[rgba(255,255,255,0.7)]">{sub.service}</span>
                      <span className="font-semibold text-[#D7FF3F]">₹{sub.amount}/mo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts + Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-bold mb-5 font-outfit">Expense Breakdown</h3>
          <div className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
            <div className="relative w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={1} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.5} />
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
            <div className="w-full mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 overflow-y-auto max-h-[140px] pr-1">
              {(() => {
                const total = (dashboardData?.categoryBreakdown || []).reduce((sum, item) => sum + item.value, 0);
                return (dashboardData?.categoryBreakdown || []).map((entry, index) => {
                  const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_6px_currentColor]" style={{ background: COLORS[index % COLORS.length] }}></span>
                        <span className="text-[rgba(255,255,255,0.5)] truncate max-w-[80px]">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="text-[rgba(255,255,255,0.35)] text-[10px]">₹{entry.value.toLocaleString('en-IN')}</span>
                        <span className="text-white text-[10px]">{percentage}%</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold font-outfit">Recent Transactions</h3>
            <button className="text-[#D7FF3F] text-xs font-semibold flex items-center gap-1 hover:underline">
              View All <ArrowRight size={13} />
            </button>
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {transactions.map(tx => (
              <motion.div
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[rgba(255,255,255,0.04)] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${tx.type === 'Expense' ? 'bg-[rgba(255,92,117,0.1)] text-[#FF5C75]' : 'bg-[rgba(166,255,77,0.1)] text-[#A6FF4D]'}`}>
                    {tx.type === 'Expense' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{tx.asset}</div>
                    <div className="text-xs text-[rgba(255,255,255,0.4)]">{tx.category} • {tx.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white text-sm">₹{tx.value}</div>
                  <div className={`text-[10px] px-2 py-0.5 rounded-md inline-block mt-1 ${tx.type === 'Expense' ? 'bg-[rgba(255,92,117,0.1)] text-[#FF5C75]' : 'bg-[rgba(166,255,77,0.1)] text-[#A6FF4D]'}`}>
                    {tx.type}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend and Top Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="text-lg font-bold mb-5 font-outfit">Income vs Expense Trend</h3>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={dashboardData?.monthlyTrend || []}
                margin={{ top: 15, right: 25, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.35)" tick={{ fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(21, 21, 24, 0.95)',
                    borderColor: 'rgba(215, 255, 63, 0.15)',
                    borderRadius: '14px',
                    color: '#fff',
                    backdropFilter: 'blur(18px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }} />
                <Bar dataKey="income" name="Income" fill="#A6FF4D" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#FF5C75" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 lg:col-span-1">
          <h3 className="text-lg font-bold mb-5 font-outfit">Top Merchant Spending</h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
            {(dashboardData?.merchantRankings || []).map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.4)] flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-white text-sm truncate max-w-[130px]">{m.merchant}</span>
                </div>
                <span className="font-bold text-[#FFB84D] text-sm">₹{m.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
            {(!dashboardData?.merchantRankings || dashboardData.merchantRankings.length === 0) && (
              <div className="text-center text-[rgba(255,255,255,0.35)] py-8 text-xs">
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
    <div className="flex h-screen w-full bg-[#0F0F11] overflow-hidden">
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
