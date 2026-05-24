import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { View, Text, TextInput, Pressable, ScrollView } from '../../src/tw';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, User as UserIcon, Mail, Lock } from 'lucide-react-native';

export default function SignupScreen() {
  const { signup, isLoading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignup = async () => {
    setLocalError(null);

    // Basic Validations
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setLocalError('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await signup(email.trim(), password, fullName.trim());
      // On success, AuthProvider will automatically trigger redirect to /(tabs)
    } catch (err: any) {
      setLocalError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F11]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerClassName="p-6 justify-center min-h-full">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl bg-[#D7FF3F] items-center justify-center mb-4 shadow-lg shadow-[#D7FF3F]/20">
              <Text className="text-[#0F0F11] text-3xl font-extrabold">C</Text>
            </View>
            <Text className="text-white text-2xl font-bold tracking-tight">Create your account</Text>
            <Text className="text-[#9898A3] text-sm mt-2 text-center">
              Begin your wealth intelligence journey with Cortex AI
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Full Name Input */}
            <View>
              <Text className="text-[#9898A3] text-xs font-semibold uppercase tracking-wider mb-2">
                Full Name
              </Text>
              <View className="flex-row items-center bg-[#18181C] border border-[#2E2E35] rounded-xl px-4 py-3.5 focus:border-[#D7FF3F]">
                <UserIcon color="#9898A3" size={18} className="mr-3" />
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor="#5C5C66"
                  value={fullName}
                  onChangeText={setFullName}
                  className="flex-1 text-white text-sm"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="mt-4">
              <Text className="text-[#9898A3] text-xs font-semibold uppercase tracking-wider mb-2">
                Email Address
              </Text>
              <View className="flex-row items-center bg-[#18181C] border border-[#2E2E35] rounded-xl px-4 py-3.5 focus:border-[#D7FF3F]">
                <Mail color="#9898A3" size={18} className="mr-3" />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor="#5C5C66"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-white text-sm"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mt-4">
              <Text className="text-[#9898A3] text-xs font-semibold uppercase tracking-wider mb-2">
                Password
              </Text>
              <View className="flex-row items-center bg-[#18181C] border border-[#2E2E35] rounded-xl px-4 py-3.5 focus:border-[#D7FF3F]">
                <Lock color="#9898A3" size={18} className="mr-3" />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#5C5C66"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-white text-sm"
                />
              </View>
            </View>

            {/* Confirm Password Input */}
            <View className="mt-4">
              <Text className="text-[#9898A3] text-xs font-semibold uppercase tracking-wider mb-2">
                Confirm Password
              </Text>
              <View className="flex-row items-center bg-[#18181C] border border-[#2E2E35] rounded-xl px-4 py-3.5 focus:border-[#D7FF3F]">
                <Lock color="#9898A3" size={18} className="mr-3" />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#5C5C66"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-white text-sm"
                />
              </View>
            </View>
          </View>

          {/* Local Error Message */}
          {localError && (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mt-6">
              <Text className="text-red-400 text-xs font-medium text-center">{localError}</Text>
            </View>
          )}

          {/* Action Button */}
          <Pressable
            onPress={handleSignup}
            disabled={isLoading}
            className={`flex-row items-center justify-center bg-[#D7FF3F] py-4 rounded-xl mt-6 shadow-md shadow-[#D7FF3F]/10 active:opacity-90 ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#0F0F11" size="small" />
            ) : (
              <>
                <Text className="text-[#0F0F11] font-bold text-sm mr-2">Get Started</Text>
                <ArrowRight color="#0F0F11" size={16} />
              </>
            )}
          </Pressable>

          {/* Switch to Login Link */}
          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-[#9898A3] text-xs">Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text className="text-[#D7FF3F] text-xs font-semibold">Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
