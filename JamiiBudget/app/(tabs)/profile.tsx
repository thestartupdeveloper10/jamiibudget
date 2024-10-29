import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import { ExpenseDB, IncomeDB } from '../../lib/appwriteDb';

// Menu items with only the necessary functionality for now
const menuItems = [
  {
    title: 'Account',
    items: [
      { id: '1', name: 'Edit Profile', icon: 'person-outline', color: '#2196F3', disabled: true },
      { id: '2', name: 'Change Password', icon: 'lock-closed-outline', color: '#4CAF50', disabled: true },
    ]
  },
  {
    title: 'Other',
    items: [
      { id: '3', name: 'Log Out', icon: 'log-out-outline', color: '#F44336', disabled: false },
    ]
  }
];

export default function Profile() {
  const { current: currentUser, logout } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBalance: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser?.$id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all transactions
        const [expenses, income] = await Promise.all([
          ExpenseDB.listByUser(currentUser.$id),
          IncomeDB.listByUser(currentUser.$id)
        ]);

        // Calculate stats
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
        
        setStats({
          totalBalance: totalIncome - totalExpenses,
          transactionCount: expenses.length + income.length
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
    if (disabled) {
      // Function not implemented yet
      return;
    }

    switch (itemId) {
      case '3': // Logout
        try {
          await logout();
          router.push('/(auth)/signIn');
        } catch (error) {
          console.error('Error logging out:', error);
        }
        break;
      default:
        console.log(`Pressed item ${itemId}`);
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
      <View className="px-4 py-6 bg-white">
        <Text className="text-2xl font-bold text-gray-800">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Card */}
        <View className="bg-white p-4 mb-6">
          <View className="flex-row items-center">
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              className="w-20 h-20 rounded-full"
            />
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-800">{currentUser?.name}</Text>
              <Text className="text-gray-500">{currentUser?.email}</Text>
              <TouchableOpacity 
                className="bg-[#351e1a] self-start px-4 py-2 rounded-full mt-2 opacity-50"
                disabled={true}
              >
                <Text className="text-white font-medium">Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-between mt-6 pt-6 border-t border-gray-100">
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#8e5347]">
                {loading ? '...' : formatAmount(stats.totalBalance)}
              </Text>
              <Text className="text-gray-500">Total Balance</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#8e5347]">
                {loading ? '...' : stats.transactionCount}
              </Text>
              <Text className="text-gray-500">Transactions</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#8e5347]">11</Text>
              <Text className="text-gray-500">Categories</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section) => (
          <View key={section.title} className="px-4 mb-6">
            <Text className="text-gray-500 mb-2 ml-1">{section.title}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleMenuItemPress(item.id, item.disabled)}
                className={`mb-2 ${item.disabled ? 'opacity-50' : ''}`}
                disabled={item.disabled}
              >
                <View
                  className="flex-row items-center justify-between p-4 bg-white rounded-xl"
                >
                  <View className="flex-row items-center">
                    <View 
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text className="text-gray-800 font-medium">{item.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="gray" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-400">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}