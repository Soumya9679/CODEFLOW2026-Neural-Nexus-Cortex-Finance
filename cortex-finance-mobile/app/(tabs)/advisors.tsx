import React, { useState, useEffect } from 'react';
import { RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { View, Text, Pressable } from '../../src/tw';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { GlassCard } from '../../src/components/GlassCard';
import apiClient from '../../src/services/api';
import { 
  Sparkles, 
  Lightbulb, 
  ArrowRight, 
  BookOpen, 
  CheckSquare, 
  Coins,
  ShieldCheck,
  Zap
} from 'lucide-react-native';

interface InsightItem {
  id?: string | number;
  title?: string;
  description: string;
  category?: string;
  impact?: 'high' | 'medium' | 'low';
}

export default function AdvisorsScreen() {
  const [summary, setSummary] = useState<string>('');
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvisoryData = async () => {
    try {
      setError(null);
      
      // Fetch summary and insights concurrently
      const [summaryRes, insightsRes] = await Promise.all([
        apiClient.get<{ summary: string }>('/summary').catch(() => ({ data: { summary: '' } })),
        apiClient.get<{ insights: string[] | InsightItem[] }>('/insights').catch(() => ({ data: { insights: [] } }))
      ]);

      setSummary(summaryRes.data.summary || 'No overall financial summary compiled yet.');

      // Normalize insights data structure (it might be string[] or InsightItem[])
      const rawInsights = insightsRes.data.insights || [];
      const normalizedInsights: InsightItem[] = rawInsights.map((item, idx) => {
        if (typeof item === 'string') {
          return {
            id: idx,
            description: item,
            title: `Insight #${idx + 1}`,
            category: 'general',
            impact: 'medium'
          };
        }
        return {
          id: item.id || idx,
          title: item.title || `Recommendation #${idx + 1}`,
          description: item.description,
          category: item.category || 'general',
          impact: item.impact || 'medium'
        };
      });

      setInsights(normalizedInsights);
    } catch (err: any) {
      console.error('Error fetching advisory insights:', err);
      setError('Could not retrieve advisory recommendations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdvisoryData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdvisoryData();
  };

  const getImpactColor = (impact?: string) => {
    if (impact === 'high') return { text: '#FF3F55', bg: 'bg-[#FF3F55]/10' };
    if (impact === 'medium') return { text: '#FFB83F', bg: 'bg-[#FFB83F]/10' };
    return { text: '#3FFFB2', bg: 'bg-[#3FFFB2]/10' };
  };

  const getCategoryIcon = (category?: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('saving') || cat.includes('budget')) {
      return <Coins color="#D7FF3F" size={16} />;
    }
    if (cat.includes('debt') || cat.includes('loan')) {
      return <Zap color="#FF3F55" size={16} />;
    }
    if (cat.includes('risk') || cat.includes('anomaly')) {
      return <ShieldCheck color="#FFB83F" size={16} />;
    }
    return <Lightbulb color="#3FFFB2" size={16} />;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F0F11]">
        <Header showWelcome={false} title="Advisors" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D7FF3F" />
          <Text className="text-[#9898A3] text-sm mt-4">Generating personalized insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F11]">
      <Header showWelcome={false} title="Wealth Advisors" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6 pb-12"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D7FF3F" />
        }
      >
        {error && (
          <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-6">
            <Text className="text-red-400 text-xs font-semibold text-center">{error}</Text>
          </View>
        )}

        <View className="space-y-6 gap-6">
          {/* Executive Summary */}
          <GlassCard glow className="p-5">
            <View className="flex-row items-center space-x-2 gap-2 mb-3.5">
              <Sparkles color="#D7FF3F" size={18} />
              <Text className="text-white text-sm font-bold">Executive RAG Summary</Text>
            </View>
            <Text className="text-[#9898A3] text-xs leading-relaxed">
              {summary}
            </Text>
          </GlassCard>

          {/* Actionable recommendations list */}
          <View className="space-y-3.5 gap-3.5">
            <View className="flex-row items-center space-x-2 gap-2">
              <BookOpen color="#3FFFB2" size={16} />
              <Text className="text-white text-sm font-bold">Actionable Insights</Text>
            </View>

            {insights.length > 0 ? (
              insights.map((insight, idx) => (
                <GlassCard key={insight.id || idx} className="p-4 flex-row items-start space-x-3.5 gap-3.5">
                  <View className="w-8 h-8 rounded-lg bg-[#1E1E24] items-center justify-center mt-0.5 border border-[#2E2E35]">
                    {getCategoryIcon(insight.category)}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-white text-xs font-bold">{insight.title}</Text>
                      <View className={`px-2 py-0.5 rounded-full ${getImpactColor(insight.impact).bg}`}>
                        <Text 
                          style={{ color: getImpactColor(insight.impact).text }}
                          className="text-[8px] font-extrabold uppercase tracking-wider"
                        >
                          {insight.impact} Priority
                        </Text>
                      </View>
                    </View>
                    <Text className="text-[#9898A3] text-xs mt-2 leading-relaxed">
                      {insight.description}
                    </Text>
                  </View>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-5 items-center justify-center">
                <Text className="text-[#9898A3] text-xs text-center py-4">
                  No statement insights generated yet. Please upload a statement file first.
                </Text>
              </GlassCard>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
