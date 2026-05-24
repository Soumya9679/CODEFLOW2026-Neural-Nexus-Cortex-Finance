import React, { useState, useRef, useEffect } from 'react';
import { 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import { View, Text, Pressable, SafeAreaView, KeyboardAvoidingView, FlatList, TextInput } from '../../src/tw';
import { Header } from '../../src/components/Header';
import { GlassCard } from '../../src/components/GlassCard';
import apiClient from '../../src/services/api';
import { Send, Sparkles, HelpCircle, Bot, MessageSquare } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

const QUICK_PROMPTS = [
  'Summarize my monthly expenses',
  'What recurring subscriptions did you detect?',
  'Explain any flagged anomalies in my statements',
  'How can I improve my financial score?'
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hi! I'm your Cortex AI Copilot. Ask me anything about your bank statements, transaction history, or financial health.",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<any>(null);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    // Auto-scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await apiClient.post<{ response: string }>('/chat', {
        query: textToSend
      });

      const aiMsg: Message = {
        id: Math.random().toString(),
        text: response.data.response || "I couldn't process that query. Let me try again.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat query error:', err);
      const errMsg: Message = {
        id: Math.random().toString(),
        text: 'Sorry, I lost connection to the advisor service. Please check your network.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F11]">
      <Header showWelcome={false} title="AI Copilot" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-6 pb-4 space-y-4 gap-4"
          className="flex-1"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <View className="w-8 h-8 rounded-lg bg-[#D7FF3F]/10 border border-[#D7FF3F]/20 items-center justify-center mr-2.5 mt-0.5">
                    <Bot color="#D7FF3F" size={16} />
                  </View>
                )}
                
                <View className="max-w-[75%]">
                  <GlassCard 
                    glow={!isUser}
                    className={`p-3.5 ${
                      isUser 
                        ? 'bg-[#1E1E24] border-[#2E2E35]' 
                        : 'bg-[#D7FF3F]/5 border-[#D7FF3F]/10'
                    }`}
                  >
                    <Text className="text-white text-xs leading-relaxed">{item.text}</Text>
                    <Text className="text-[#5C5C66] text-[8px] font-semibold text-right mt-1.5">
                      {item.timestamp}
                    </Text>
                  </GlassCard>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            sending ? (
              <View className="flex-row justify-start items-center ml-10 py-2">
                <ActivityIndicator size="small" color="#D7FF3F" />
                <Text className="text-[#9898A3] text-[10px] font-medium ml-2">Cortex AI typing...</Text>
              </View>
            ) : null
          }
        />

        {/* Quick Prompts Container */}
        {messages.length === 1 && (
          <View className="px-6 py-2">
            <Text className="text-[#9898A3] text-[10px] font-semibold uppercase tracking-wider mb-2.5">
              Suggested Prompts
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={QUICK_PROMPTS}
              keyExtractor={(item) => item}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => sendMessage(item)}
                  className="bg-[#1E1E24] border border-[#2E2E35] px-4 py-2.5 rounded-xl active:bg-[#2E2E35]"
                >
                  <Text className="text-[#D7FF3F] text-xs font-semibold">{item}</Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* Input Bar */}
        <View className="p-4 border-t border-[#1F1F24] bg-[#0F0F11]">
          <View className="flex-row items-center bg-[#1E1E24] rounded-xl border border-[#2E2E35] px-3.5 h-12">
            <TextInput
              placeholder="Ask anything about your statement..."
              placeholderTextColor="#5C5C66"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => sendMessage(inputText)}
              className="flex-1 text-white text-xs font-medium pr-2.5 h-full"
            />
            
            <Pressable
              onPress={() => sendMessage(inputText)}
              disabled={sending || !inputText.trim()}
              className="w-8 h-8 rounded-lg bg-[#D7FF3F] items-center justify-center active:opacity-90 disabled:opacity-40"
            >
              <Send color="#0F0F11" size={14} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
