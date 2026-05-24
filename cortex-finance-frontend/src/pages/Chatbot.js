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
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2 font-outfit">
            <Sparkles className="text-[#D7FF3F] animate-pulse" size={22} />
            Cortex AI Assistant
          </h2>
          <p className="text-xs text-[rgba(255,255,255,0.4)]">Deep statement analysis & planning</p>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex-1 glass-panel flex flex-col overflow-hidden relative border border-[rgba(255,255,255,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl">
        
        {/* Messages Scrolling Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Icon */}
                {msg.sender === 'bot' && (
                  <div className="w-9 h-9 rounded-xl bg-[rgba(215,255,63,0.08)] text-[#D7FF3F] flex items-center justify-center shrink-0 border border-[rgba(215,255,63,0.12)] shadow-[0_0_12px_rgba(215,255,63,0.08)]">
                    <Bot size={18} />
                  </div>
                )}

                {/* Message Bubble */}
                <div 
                  className={`max-w-[75%] p-4 rounded-2xl shadow-lg border ${
                    msg.sender === 'user'
                      ? 'bg-[rgba(215,255,63,0.08)] border-[rgba(215,255,63,0.12)] text-white rounded-tr-none'
                      : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.05)] text-white rounded-tl-none'
                  }`}
                >
                  <div className="space-y-1">
                    {msg.sender === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="text-[rgba(255,255,255,0.65)] text-sm max-w-none space-y-2">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-xl font-extrabold text-gradient mt-4 mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mt-4 mb-2 border-b border-[rgba(255,255,255,0.05)] pb-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-md font-bold text-white mt-3 mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="text-[rgba(255,255,255,0.65)] text-sm leading-relaxed mb-3" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="text-[rgba(255,255,255,0.65)] text-sm leading-relaxed" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-[#D7FF3F]" {...props} />,
                            code: ({node, ...props}) => <code className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#FFB84D] font-mono text-sm border border-[rgba(255,255,255,0.05)]" {...props} />
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
                  <div className="w-9 h-9 rounded-xl bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.5)] flex items-center justify-center shrink-0 border border-[rgba(255,255,255,0.06)]">
                    <User size={18} />
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
              className="flex gap-3.5 justify-start"
            >
              <div className="w-9 h-9 rounded-xl bg-[rgba(215,255,63,0.08)] text-[#D7FF3F] flex items-center justify-center shrink-0 border border-[rgba(215,255,63,0.12)]">
                <Bot size={18} />
              </div>
              <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                <Loader2 size={15} className="text-[#D7FF3F] animate-spin" />
                <span className="text-xs text-[rgba(255,255,255,0.5)] font-medium">Cortex AI is analyzing...</span>
              </div>
            </motion.div>
          )}

          {/* Invisible anchor for scrolling */}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Quick suggestions */}
        {messages.length === 1 && !isLoading && (
          <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.04)] bg-[rgba(15,15,17,0.5)] flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(215,255,63,0.06)' }}
                whileTap={{ scale: 0.98 }}
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="text-[10px] px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#D7FF3F] font-medium hover:border-[rgba(215,255,63,0.2)] transition-all"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(15,15,17,0.6)] flex gap-3">
          <input
            type="text"
            placeholder="Ask AI about overspending patterns, statement health, or optimization plans..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1 px-4 py-3.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white placeholder-[rgba(255,255,255,0.25)] focus:outline-none focus:border-[rgba(215,255,63,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="px-5 py-3.5 bg-[#D7FF3F] text-[#0F0F11] rounded-xl font-semibold text-sm flex items-center gap-2 hover:shadow-[0_0_25px_rgba(215,255,63,0.35)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Send</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default Chatbot;
