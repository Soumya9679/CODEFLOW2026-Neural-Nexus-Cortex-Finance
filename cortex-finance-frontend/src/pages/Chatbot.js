/* eslint-disable jsx-a11y/heading-has-content */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api/mockService';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! 👋 I'm your **Cortex AI Financial Assistant**. I can analyze your statement transactions, identify overspending habits, calculate savings potential, and suggest personalized budgeting strategies. Ask me anything about your finances!",
      sender: "bot"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Suggestion chips
  const suggestions = [
    "Analyze my savings rate",
    "Where is my overspending?",
    "How can I improve my financial health?",
    "Show recurring expenses"
  ];

  // Send a message
  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;
    
    // Add user message
    const userMsg = { text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    
    if (!textToSend) {
      setInput('');
    }

    setIsLoading(true);

    try {
      // Call live /chat API endpoint
      const response = await api.post('/chat', { message: text });
      
      const reply = response.data.reply || response.data.response || "I couldn't process that response. Please try again.";
      
      setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        { 
          text: "⚠️ **System Error**: I could not reach the Cortex AI engine. Please ensure your backend server is running or switch to **Mock Mode** in settings.",
          sender: 'bot' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-140px)] flex flex-col max-w-5xl mx-auto"
    >
      {/* Top Title Bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="text-accentCyan animate-pulse" size={24} />
            Cortex AI Assistant
          </h2>
          <p className="text-sm text-textSecondary">Deep statement analysis & planning</p>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex-1 glass-panel flex flex-col overflow-hidden relative border border-glassBorder/60 shadow-2xl rounded-2xl">
        
        {/* Messages Scrolling Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Icon */}
                {msg.sender === 'bot' && (
                  <div className="w-10 h-10 rounded-xl bg-accentCyan/15 text-accentCyan flex items-center justify-center shrink-0 border border-accentCyan/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                    <Bot size={20} />
                  </div>
                )}

                {/* Message Bubble */}
                <div 
                  className={`max-w-[75%] p-4 rounded-2xl shadow-lg border ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-accentCyan/20 to-accentPurple/25 border-accentCyan/30 text-white rounded-tr-none'
                      : 'bg-slate-900/60 border-glassBorder/60 text-white rounded-tl-none'
                  }`}
                >
                  <div className="space-y-1">
                    {msg.sender === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="text-textSecondary text-sm max-w-none space-y-2">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accentCyan to-accentPurple mt-4 mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mt-4 mb-2 border-b border-glassBorder pb-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-md font-bold text-white mt-3 mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="text-textSecondary text-sm leading-relaxed mb-3" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="text-textSecondary text-sm leading-relaxed" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-accentCyan" {...props} />,
                            code: ({node, ...props}) => <code className="px-1.5 py-0.5 rounded bg-slate-800 text-accentPurple font-mono text-sm border border-glassBorder" {...props} />
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Icon */}
                {msg.sender === 'user' && (
                  <div className="w-10 h-10 rounded-xl bg-accentPurple/15 text-accentPurple flex items-center justify-center shrink-0 border border-accentPurple/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                    <User size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 justify-start"
            >
              <div className="w-10 h-10 rounded-xl bg-accentCyan/15 text-accentCyan flex items-center justify-center shrink-0 border border-accentCyan/30">
                <Bot size={20} />
              </div>
              <div className="bg-slate-900/60 border border-glassBorder/60 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                <Loader2 size={16} className="text-accentCyan animate-spin" />
                <span className="text-sm text-textSecondary font-medium">Cortex AI is analyzing...</span>
              </div>
            </motion.div>
          )}

          {/* Invisible anchor for scrolling */}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Quick suggestions */}
        {messages.length === 1 && !isLoading && (
          <div className="px-6 py-3 border-t border-glassBorder/30 bg-slate-950/20 flex flex-wrap gap-2.5">
            {suggestions.map((suggestion, idx) => (
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                whileTap={{ scale: 0.98 }}
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="text-xs px-3.5 py-1.5 rounded-full border border-glassBorder bg-slate-900/40 text-accentCyan font-medium hover:border-accentCyan/40 hover:text-white transition-all shadow-sm"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-glassBorder/60 bg-slate-950/40 flex gap-3">
          <input
            type="text"
            placeholder="Ask AI about overspending patterns, statement health, or optimization plans..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1 px-4 py-3.5 bg-slate-900/70 border border-glassBorder/80 rounded-xl text-sm text-white placeholder-textSecondary/70 focus:outline-none focus:border-accentCyan/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="px-5 py-3.5 bg-gradient-to-r from-accentCyan to-accentPurple text-white rounded-xl font-semibold text-sm flex items-center gap-2 hover:brightness-110 active:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,211,238,0.25)]"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span>Send</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default Chatbot;
