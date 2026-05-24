import React, { useState, useEffect } from 'react';
import { 
  RefreshControl, 
  ActivityIndicator, 
  Platform
} from 'react-native';
import { View, Text, Pressable, ScrollView, SafeAreaView, FlatList, TextInput } from '../../src/tw';
import { Header } from '../../src/components/Header';
import { GlassCard } from '../../src/components/GlassCard';
import * as DocumentPicker from 'expo-document-picker';
import apiClient from '../../src/services/api';
import { Transaction } from '../../src/services/types';
import { 
  UploadCloud, 
  Search, 
  AlertTriangle, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  CheckCircle,
  HelpCircle,
  Filter
} from 'lucide-react-native';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // File Picking & Uploading States
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'expense' | 'anomaly' | 'recurring'>('all');

  const fetchTransactions = async () => {
    try {
      setError(null);
      const response = await apiClient.get<{ transactions: Transaction[] }>('/transactions');
      // Sort transactions by date descending
      const sorted = (response.data.transactions || []).sort(
        (a, b) => b.date.localeCompare(a.date)
      );
      setTransactions(sorted);
      applyFilterAndSearch(sorted, searchQuery, selectedFilter);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError('Could not retrieve transaction records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handlePickDocument = async () => {
    try {
      setUploadSuccess(false);
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/csv'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setSelectedFile(res.assets[0]);
      }
    } catch (err) {
      console.error('Document picker error:', err);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    // React Native FormData construction
    formData.append('file', {
      uri: Platform.OS === 'android' ? selectedFile.uri : selectedFile.uri.replace('file://', ''),
      name: selectedFile.name,
      type: selectedFile.mimeType || 'application/pdf',
    } as any);

    try {
      await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadSuccess(true);
      setSelectedFile(null);
      // Re-fetch transactions
      await fetchTransactions();
    } catch (err: any) {
      console.error('Upload statement error:', err);
      setError(err?.response?.data?.detail || 'Failed to upload and analyze the statement file.');
    } finally {
      setUploading(false);
    }
  };

  const applyFilterAndSearch = (
    list: Transaction[],
    query: string,
    filter: typeof selectedFilter
  ) => {
    let result = [...list];

    // Search query mapping
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        t => 
          (t.narration || '').toLowerCase().includes(q) || 
          (t.category || '').toLowerCase().includes(q)
      );
    }

    // Type filter mapping
    if (filter === 'income') {
      result = result.filter(t => (t.credit || 0) > 0);
    } else if (filter === 'expense') {
      result = result.filter(t => (t.debit || 0) > 0);
    } else if (filter === 'anomaly') {
      result = result.filter(t => t.is_anomaly === 1);
    } else if (filter === 'recurring') {
      result = result.filter(t => t.is_recurring === 1);
    }

    setFilteredTransactions(result);
  };

  useEffect(() => {
    applyFilterAndSearch(transactions, searchQuery, selectedFilter);
  }, [searchQuery, selectedFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F11]">
      <Header showWelcome={false} title="Transactions" />

      {/* Main FlatList wrapping Header sections as ListHeaderComponent */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerClassName="p-6 pb-12"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D7FF3F" />
        }
        ListHeaderComponent={
          <View className="space-y-6 gap-6 mb-6">
            {/* Error Message banner */}
            {error && (
              <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
                <Text className="text-red-400 text-xs font-semibold text-center">{error}</Text>
              </View>
            )}

            {/* Document upload portal */}
            <GlassCard className="p-5">
              <Text className="text-white text-sm font-bold mb-3.5">Upload Statements</Text>
              
              {!selectedFile ? (
                <Pressable
                  onPress={handlePickDocument}
                  className="h-28 border border-dashed border-[#2E2E35] rounded-xl items-center justify-center space-y-2 bg-[#1E1E24]/10 active:bg-[#1E1E24]/30"
                >
                  <UploadCloud color="#D7FF3F" size={24} />
                  <Text className="text-white text-xs font-semibold mt-1">Select Bank Statement PDF or CSV</Text>
                  <Text className="text-[#5C5C66] text-[10px] mt-0.5">Supports standard bank formats</Text>
                </Pressable>
              ) : (
                <View className="bg-[#1E1E24]/40 border border-[#2E2E35] rounded-xl p-4 space-y-4">
                  <View className="flex-row items-center space-x-3 gap-3">
                    <View className="w-10 h-10 bg-[#D7FF3F]/10 rounded-lg items-center justify-center">
                      <FileText color="#D7FF3F" size={20} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-xs font-semibold" numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <Text className="text-[#9898A3] text-[10px] mt-0.5">
                        {formatSize(selectedFile.size)}
                      </Text>
                    </View>
                    <Pressable 
                      onPress={() => setSelectedFile(null)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#2E2E35]/40"
                    >
                      <Text className="text-red-400 text-[10px] font-bold">Clear</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    disabled={uploading}
                    onPress={handleUploadFile}
                    className="h-11 items-center justify-center bg-[#D7FF3F] rounded-xl shadow-md active:opacity-90 disabled:opacity-50"
                  >
                    {uploading ? (
                      <View className="flex-row items-center space-x-2 gap-2">
                        <ActivityIndicator size="small" color="#0F0F11" />
                        <Text className="text-[#0F0F11] font-bold text-xs">AI Statement Extraction...</Text>
                      </View>
                    ) : (
                      <Text className="text-[#0F0F11] font-bold text-xs">Analyze Statement</Text>
                    )}
                  </Pressable>
                </View>
              )}

              {/* Upload Success message banner */}
              {uploadSuccess && (
                <View className="flex-row items-center space-x-2 gap-2 bg-[#3FFFB2]/10 border border-[#3FFFB2]/20 rounded-xl p-3.5 mt-4">
                  <CheckCircle color="#3FFFB2" size={16} />
                  <Text className="text-[#3FFFB2] text-xs font-semibold">
                    Statement processed and vector store rebuilt successfully!
                  </Text>
                </View>
              )}
            </GlassCard>

            {/* Filter segments & Search */}
            <View className="space-y-4 gap-4">
              <View className="flex-row items-center bg-[#1E1E24] px-3.5 rounded-xl border border-[#2E2E35] h-11">
                <Search color="#9898A3" size={16} />
                <TextInput
                  placeholder="Search merchant or category..."
                  placeholderTextColor="#5C5C66"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 text-white text-xs font-medium px-2.5 h-full"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Text className="text-[#9898A3] text-xs">Clear</Text>
                  </Pressable>
                )}
              </View>

              {/* Category Segment Filter buttons */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
                className="flex-row"
              >
                {(['all', 'income', 'expense', 'anomaly', 'recurring'] as const).map((filter) => (
                  <Pressable
                    key={filter}
                    onPress={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-xl border ${
                      selectedFilter === filter 
                        ? 'bg-[#D7FF3F] border-[#D7FF3F]' 
                        : 'bg-[#1E1E24] border-[#2E2E35]'
                    }`}
                  >
                    <Text 
                      className={`text-xs font-bold capitalize ${
                        selectedFilter === filter ? 'text-[#0F0F11]' : 'text-[#9898A3]'
                      }`}
                    >
                      {filter === 'all' ? 'All Transactions' : filter}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="py-8 items-center justify-center">
              <ActivityIndicator size="small" color="#D7FF3F" />
            </View>
          ) : (
            <View className="py-12 items-center justify-center">
              <HelpCircle color="#5C5C66" size={24} />
              <Text className="text-[#9898A3] text-xs mt-3 text-center">
                No matching transactions found.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isCredit = (item.credit || 0) > 0;
          return (
            <GlassCard className="p-4 mb-3 flex-row items-center justify-between border-[#2E2E35]">
              <View className="flex-row items-center space-x-3.5 gap-3.5 flex-1 pr-4">
                {/* Arrow Icon Indicator */}
                <View className={`w-9 h-9 rounded-lg items-center justify-center ${
                  isCredit ? 'bg-[#3FFFB2]/10' : 'bg-[#FF3F55]/10'
                }`}>
                  {isCredit ? (
                    <ArrowDownLeft color="#3FFFB2" size={16} />
                  ) : (
                    <ArrowUpRight color="#FF3F55" size={16} />
                  )}
                </View>

                {/* Details */}
                <View className="flex-1">
                  <View className="flex-row items-center space-x-2 gap-2 flex-wrap">
                    <Text className="text-white text-xs font-bold" numberOfLines={1}>
                      {item.narration}
                    </Text>
                    {item.is_anomaly === 1 && (
                      <View className="bg-red-500/10 px-2 py-0.5 rounded-full flex-row items-center">
                        <AlertTriangle color="#FF3F55" size={8} />
                        <Text className="text-[#FF3F55] text-[8px] font-bold ml-0.5">Anomaly</Text>
                      </View>
                    )}
                    {item.is_recurring === 1 && (
                      <View className="bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        <Text className="text-cyan-400 text-[8px] font-bold">Recurring</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center space-x-2 gap-2 mt-1">
                    <Calendar color="#5C5C66" size={10} />
                    <Text className="text-[#9898A3] text-[10px] font-medium">{item.date}</Text>
                    <Text className="text-[#5C5C66] text-[10px] font-semibold">•</Text>
                    <View className="bg-[#1F1F24] px-2 py-0.5 rounded-md">
                      <Text className="text-[#9898A3] text-[9px] font-bold capitalize">{item.category}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Amount */}
              <Text className={`text-xs font-bold ${
                isCredit ? 'text-[#3FFFB2]' : 'text-white'
              }`}>
                {isCredit ? '+' : '-'}{formatCurrency(item.credit || item.debit || 0)}
              </Text>
            </GlassCard>
          );
        }}
      />
    </SafeAreaView>
  );
}
