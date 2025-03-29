import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import { ExpenseDB, IncomeDB } from '../../lib/appwriteDb';

// Add these type imports at the top
type Transaction = {
  $id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
};

// Update the stats type
type Stats = {
  totalBalance: number;
  transactionCount: number;
  categoriesCount: number;
};

// Menu items with only the necessary functionality for now
const menuItems = [
  {
    title: 'Account Settings',
    items: [
      { 
        id: '1', 
        name: 'Edit Profile', 
        icon: 'person-outline', 
        color: '#006D77', 
        disabled: false,
        description: 'Update your personal information'
      },
      { 
        id: '2', 
        name: 'Change Password', 
        icon: 'lock-closed-outline', 
        color: '#2A9D8F', 
        disabled: false,
        description: 'Manage your account security'
      },
    ]
  },
  {
    title: 'App Settings',
    items: [
      { 
        id: '3', 
        name: 'Log Out', 
        icon: 'log-out-outline', 
        color: '#E76F51', 
        disabled: false,
        description: 'Sign out of your account'
      },
    ]
  }
];

export default function Profile() {
  const { current: currentUser, logout } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalBalance: 0,
    transactionCount: 0,
    categoriesCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser?.$id) {
        setLoading(false);
        return;
      }

      try {
        const [expenses, income] = await Promise.all([
          ExpenseDB.listByUser(currentUser.$id),
          IncomeDB.listByUser(currentUser.$id)
        ]);

        // Calculate stats
        const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const totalIncome = income.reduce((sum, inc) => sum + (inc.amount || 0), 0);
        
        // Get unique categories
        const uniqueCategories = new Set([
          ...expenses.map(exp => exp.category),
          ...income.map(inc => inc.category)
        ]);

        setStats({
          totalBalance: totalIncome - totalExpenses,
          transactionCount: expenses.length + income.length,
          categoriesCount: uniqueCategories.size
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  const handleMenuItemPress = async (itemId: string, disabled: boolean) => {
    if (disabled) return;

    switch (itemId) {
      case '1': // Edit Profile
        router.push('/(auth)/editProfile');
        break;
      case '2': // Change Password
        router.push('/(auth)/changePassword');
        break;
      case '3': // Logout
        try {
          await logout();
          router.push('/(auth)/signIn');
        } catch (error) {
          console.error('Error logging out:', error);
        }
        break;
    }
  };

  const formatAmount = (amount: number) => {
    return `KES ${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-4 pt-6 pb-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Card */}
        <View className="bg-white mt-6 mx-4 p-6 rounded-2xl shadow-sm">
          <View className="flex-row items-center">
            <View className="relative">
              <Image
                source={{ uri: 'https://via.placeholder.com/100' }}
                className="w-20 h-20 rounded-full"
              />
              <View className="absolute bottom-0 right-0 bg-[#006D77] w-6 h-6 rounded-full items-center justify-center">
                <Ionicons name="camera-outline" size={16} color="white" />
              </View>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-900">{currentUser?.name}</Text>
              <Text className="text-gray-500 mb-2">{currentUser?.email}</Text>
              <TouchableOpacity 
                className="bg-[#006D77]/10 self-start px-4 py-2 rounded-full"
                onPress={() => router.push('/(auth)/editProfile')}
              >
                <Text className="text-[#006D77] font-medium">Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View className="flex-row mt-8 gap-4">
            <View className="flex-1 bg-[#006D77]/5 p-4 rounded-xl">
              <View className="w-10 h-10 bg-[#006D77]/10 rounded-full items-center justify-center mb-2">
                <Ionicons name="wallet-outline" size={20} color="#006D77" />
              </View>
              <Text className="text-2xl font-bold text-[#006D77]">
                {loading ? '...' : formatAmount(stats.totalBalance)}
              </Text>
              <Text className="text-gray-600">Balance</Text>
            </View>
            
            <View className="flex-1 bg-[#2A9D8F]/5 p-4 rounded-xl">
              <View className="w-10 h-10 bg-[#2A9D8F]/10 rounded-full items-center justify-center mb-2">
                <Ionicons name="swap-horizontal-outline" size={20} color="#2A9D8F" />
              </View>
              <Text className="text-2xl font-bold text-[#2A9D8F]">
                {loading ? '...' : stats.transactionCount}
              </Text>
              <Text className="text-gray-600">Transactions</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section) => (
          <View key={section.title} className="mt-8 px-4">
            <Text className="text-sm font-medium text-gray-500 mb-3 px-1">
              {section.title}
            </Text>
            <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleMenuItemPress(item.id, item.disabled)}
                  disabled={item.disabled}
                >
                  <View className={`p-4 flex-row items-center justify-between
                    ${index !== section.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View 
                        className="w-10 h-10 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                      </View>
                      <View>
                        <Text className="text-gray-900 font-medium mb-0.5">{item.name}</Text>
                        <Text className="text-gray-500 text-sm">{item.description}</Text>
                      </View>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color="#9CA3AF"
                      style={{ opacity: item.disabled ? 0.5 : 1 }} 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View className="mt-8 mb-8 items-center">
          <Image 
            source={require('../../assets/images/logo.png')}
            className="w-12 h-12 mb-2 opacity-50"
          />
          <Text className="text-gray-400 text-sm">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}