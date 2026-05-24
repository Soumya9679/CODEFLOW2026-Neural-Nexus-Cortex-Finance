import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, ArrowLeftRight, MessageSquareCode, Users } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#D7FF3F',
        tabBarInactiveTintColor: '#9898A3',
        tabBarStyle: {
          backgroundColor: '#121216',
          borderTopColor: '#1F1F24',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => <ArrowLeftRight color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Copilot',
          tabBarIcon: ({ color, size }) => <MessageSquareCode color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="advisors"
        options={{
          title: 'Advisors',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
