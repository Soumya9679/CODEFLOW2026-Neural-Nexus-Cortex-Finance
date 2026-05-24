import React from 'react';
import { View, Text, Pressable } from '../tw';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  showWelcome?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showWelcome = true }) => {
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View className="flex-row items-center justify-between px-6 py-4 bg-[#121216]/80 border-b border-[#1F1F24] backdrop-blur-md">
      <View>
        {showWelcome && user ? (
          <View>
            <Text className="text-[#9898A3] text-xs font-semibold uppercase tracking-wider">
              Welcome back
            </Text>
            <Text className="text-white text-lg font-bold mt-0.5">
              {user.full_name || 'User'}
            </Text>
          </View>
        ) : (
          <Text className="text-white text-xl font-bold tracking-tight">
            {title || 'Cortex Finance'}
          </Text>
        )}
      </View>

      <View className="flex-row items-center space-x-3 gap-3">
        {/* Notification Icon */}
        <Pressable className="w-10 h-10 rounded-full bg-[#18181C] border border-[#2E2E35] items-center justify-center active:opacity-80">
          <Bell color="#9898A3" size={18} />
        </Pressable>

        {/* User initials bubble & logout */}
        <Pressable 
          onPress={logout}
          className="flex-row items-center bg-[#18181C] border border-[#2E2E35] pl-2 pr-3 py-1.5 rounded-full active:opacity-80"
        >
          <View className="w-7 h-7 rounded-full bg-[#D7FF3F] items-center justify-center mr-2">
            <Text className="text-[#0F0F11] text-xs font-bold">
              {getInitials(user?.full_name || undefined)}
            </Text>
          </View>
          <LogOut color="#9898A3" size={15} />
        </Pressable>
      </View>
    </View>
  );
};
