import React, { useState, useEffect } from 'react';
import { RefreshControl, ActivityIndicator } from 'react-native';
import { View, Text, Pressable, ScrollView, SafeAreaView } from '../../src/tw';
import { Header } from '../../src/components/Header';
import { GlassCard } from '../../src/components/GlassCard';
import apiClient from '../../src/services/api';
import { DashboardData } from '../../src/services/types';
import { useRouter } from 'expo-router';
import { DashboardCharts } from '../../src/components/DashboardCharts';

import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Percent, 
  AlertTriangle, 
  CalendarDays, 
  ArrowUpRight, 
  ShieldAlert,
  ChevronRight,
  PieChart as PieIcon
} from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await apiClient.get<DashboardData>('/dashboard');
      setData(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard details:', err);
      setError('Could not sync financial statistics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getScoreClassification = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: '#D7FF3F', bg: 'bg-[#D7FF3F]/10' };
    if (score >= 60) return { label: 'Good', color: '#3FFFB2', bg: 'bg-[#3FFFB2]/10' };
    if (score >= 40) return { label: 'Fair', color: '#FFB83F', bg: 'bg-[#FFB83F]/10' };
    return { label: 'Needs Review', color: '#FF3F55', bg: 'bg-[#FF3F55]/10' };
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F0F11]">
        <Header showWelcome={false} title="Dashboard" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D7FF3F" />
          <Text className="text-[#9898A3] text-sm mt-4">Analyzing statement data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasData = data && (data.income > 0 || data.expense > 0);

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F11]">
      <Header showWelcome={true} />
      
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-6 pb-12"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D7FF3F" />
        }
      >
        {/* Error message */}
        {error && (
          <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-6">
            <Text className="text-red-400 text-xs font-medium text-center">{error}</Text>
          </View>
        )}

        {/* Empty state dashboard */}
        {!hasData ? (
          <View className="space-y-6">
            <GlassCard className="py-8 px-6 items-center text-center space-y-4">
              <View className="w-16 h-16 rounded-full bg-[#1F1F24] border border-[#2E2E35] items-center justify-center mb-2">
                <Wallet color="#D7FF3F" size={28} />
              </View>
              <Text className="text-white text-xl font-bold">No Financial Data Loaded</Text>
              <Text className="text-[#9898A3] text-sm text-center max-w-[280px] mt-2 mb-4 leading-relaxed">
                Upload your bank statement PDF to view spending analysis, anomaly detection, and RAG insights.
              </Text>
              <Pressable
                onPress={() => router.push('/transactions')}
                className="flex-row items-center justify-center bg-[#D7FF3F] py-3.5 px-6 rounded-xl shadow-md shadow-[#D7FF3F]/10 active:opacity-90"
              >
                <Text className="text-[#0F0F11] font-bold text-sm mr-2">Upload Statement</Text>
                <ArrowUpRight color="#0F0F11" size={16} />
              </Pressable>
            </GlassCard>
          </View>
        ) : (
          data && (
            <View className="space-y-6 gap-6">
              {/* Financial Health Score & Net Savings Card */}
              <GlassCard glow className="p-5 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-[#9898A3] text-xs font-semibold uppercase tracking-wider">
                    Financial Health
                  </Text>
                  <View className="flex-row items-baseline mt-1.5">
                    <Text className="text-white text-3xl font-extrabold">{data.score}</Text>
                    <Text className="text-[#9898A3] text-xs ml-1">/ 100</Text>
                  </View>
                  <View className="flex-row items-center mt-3">
                    <View className={`px-2.5 py-0.5 rounded-full ${getScoreClassification(data.score).bg}`}>
                      <Text 
                        style={{ color: getScoreClassification(data.score).color }}
                        className="text-[11px] font-bold"
                      >
                        {getScoreClassification(data.score).label}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Savings Rate Circle Badge */}
                <View className="items-end">
                  <Text className="text-[#9898A3] text-xs font-semibold uppercase tracking-wider mb-2">
                    Savings Rate
                  </Text>
                  <View className="w-20 h-20 rounded-full border-4 border-[#1F1F24] items-center justify-center relative">
                    <View className="absolute inset-0 rounded-full border-4 border-[#D7FF3F]" style={{ opacity: 0.85 }} />
                    <Text className="text-white text-base font-extrabold">{data.savings_rate}%</Text>
                  </View>
                </View>
              </GlassCard>

              {/* Main Net Balance Summary */}
              <View className="flex-row space-x-4 gap-4">
                <GlassCard className="flex-1 p-4">
                  <View className="w-8 h-8 rounded-lg bg-[#3FFFB2]/10 items-center justify-center mb-3">
                    <TrendingUp color="#3FFFB2" size={16} />
                  </View>
                  <Text className="text-[#9898A3] text-xs font-medium">Total Credits</Text>
                  <Text className="text-white text-lg font-bold mt-1">
                    {formatCurrency(data.income)}
                  </Text>
                </GlassCard>

                <GlassCard className="flex-1 p-4">
                  <View className="w-8 h-8 rounded-lg bg-[#FF3F55]/10 items-center justify-center mb-3">
                    <TrendingDown color="#FF3F55" size={16} />
                  </View>
                  <Text className="text-[#9898A3] text-xs font-medium">Total Debits</Text>
                  <Text className="text-white text-lg font-bold mt-1">
                    {formatCurrency(data.expense)}
                  </Text>
                </GlassCard>
              </View>

              {/* Interactive SVG Charts */}
              <GlassCard className="p-5">
                <DashboardCharts monthlyTrend={data.monthly_trend || {}} />
              </GlassCard>

              {/* Categories breakdown */}
              <GlassCard className="p-5">
                <Text className="text-white text-sm font-bold mb-4">Category Breakdown</Text>
                <View className="space-y-3.5 gap-3.5">
                  {Object.entries(data.categories || {}).map(([category, amount]) => {
                    const percentage = Math.round((amount / data.expense) * 100) || 0;
                    return (
                      <View key={category} className="space-y-1">
                        <View className="flex-row justify-between text-xs">
                          <Text className="text-white font-medium text-xs">{category}</Text>
                          <Text className="text-[#9898A3] font-medium text-xs">
                            {formatCurrency(amount)} ({percentage}%)
                          </Text>
                        </View>
                        <View className="h-1.5 w-full bg-[#1F1F24] rounded-full overflow-hidden mt-1">
                          <View 
                            className="h-full bg-[#D7FF3F] rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </GlassCard>

              {/* Anomaly Indicator */}
              <GlassCard className="p-5">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center space-x-2 gap-2">
                    <ShieldAlert color="#FF3F55" size={18} />
                    <Text className="text-white text-sm font-bold">Risk Assessment</Text>
                  </View>
                  <View className="bg-[#FF3F55]/10 px-2.5 py-0.5 rounded-full">
                    <Text className="text-[#FF3F55] text-[10px] font-bold">
                      {data.anomalies?.length || 0} flagged
                    </Text>
                  </View>
                </View>

                {data.anomalies && data.anomalies.length > 0 ? (
                  <View className="space-y-3 gap-3">
                    {data.anomalies.slice(0, 2).map((anomaly: any, idx: number) => (
                      <View key={idx} className="flex-row items-center justify-between bg-[#1E1E24] p-3 rounded-xl border border-red-500/10">
                        <View className="flex-1 pr-3">
                          <Text className="text-white text-xs font-semibold" numberOfLines={1}>
                            {anomaly.narration}
                          </Text>
                          <Text className="text-[#9898A3] text-[10px] mt-0.5">
                            {anomaly.date} • {anomaly.category}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-[#FF3F55] text-xs font-bold">
                            {formatCurrency(anomaly.amount)}
                          </Text>
                          <Text className="text-[#FF3F55]/80 text-[9px] font-semibold mt-0.5">
                            Unusual Expense
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-[#9898A3] text-xs text-center py-2">
                    No unusual anomalies detected in your statements.
                  </Text>
                )}
              </GlassCard>

              {/* Recurring Payments */}
              <GlassCard className="p-5">
                <View className="flex-row items-center space-x-2 gap-2 mb-4">
                  <CalendarDays color="#3FFFB2" size={18} />
                  <Text className="text-white text-sm font-bold">Detected Subscriptions</Text>
                </View>

                {data.recurring_payments && data.recurring_payments.length > 0 ? (
                  <View className="space-y-3 gap-3">
                    {data.recurring_payments.slice(0, 3).map((sub: any, idx: number) => (
                      <View key={idx} className="flex-row items-center justify-between bg-[#1E1E24]/60 p-3 rounded-xl">
                        <View>
                          <Text className="text-white text-xs font-semibold">{sub.narration}</Text>
                          <Text className="text-[#9898A3] text-[10px] mt-0.5">
                            Recurring • {sub.category}
                          </Text>
                        </View>
                        <Text className="text-[#3FFFB2] text-xs font-bold">
                          {formatCurrency(sub.amount)}/mo
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="text-[#9898A3] text-xs text-center py-2">
                    No active recurring payments detected yet.
                  </Text>
                )}
              </GlassCard>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
