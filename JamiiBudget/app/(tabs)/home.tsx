import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import TransactionItem from '../../components/TransactionItem';
import { Link, useRouter } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import { ExpenseDB, IncomeDB } from '../../lib/appwriteDb';
import { useFocusEffect } from '@react-navigation/native';


// Define the transaction type based on your database structure
type Transaction = {
  $id?: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt?: string;
};

// Icon mappings for categories
const categoryIcons = {
  food: { icon: 'fast-food', bgColor: '#FFF3E0', color: '#FFB74D' },
  shopping: { icon: 'cart', bgColor: '#E3F2FD', color: '#42A5F5' },
  transport: { icon: 'car', bgColor: '#E8F5E9', color: '#66BB6A' },
  bills: { icon: 'receipt', bgColor: '#E3F2FD', color: '#F44336' },
  entertainment: { icon: 'game-controller', bgColor: '#E3F2FD', color: '#9C27B0' },
  education: { icon: 'book', bgColor: '#E8F5E9', color: '#4CAF50' },
  salary: { icon: 'wallet', bgColor: '#E3F2FD', color: '#42A5F5' },
  freelance: { icon: 'laptop', bgColor: '#E3F2FD', color: '#3F51B5' },
  investment: { icon: 'trending-up', bgColor: '#ECEFF1', color: '#607D8B' },
  business: { icon: 'business', bgColor: '#E0F2F1', color: '#009688' },
  other: { icon: 'ellipsis-horizontal', bgColor: '#EFEBE9', color: '#795548' }
};

// Add Quick Actions for the home screen
const QuickActions = [
  { id: 1, name: 'Add Income', icon: 'arrow-up-circle', color: '#4CAF50' },
  { id: 2, name: 'Add Expense', icon: 'arrow-down-circle', color: '#FF6B6B' },
  { id: 3, name: 'View\nStats', icon: 'stats-chart', color: '#2196F3' },
];

export default function Home() {
  const { current: user } = useUser();
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!user?.$id) return;

        try {
          const [expenseData, incomeData] = await Promise.all([
            ExpenseDB.listByUser(user.$id),
            IncomeDB.listByUser(user.$id)
          ]);

          setExpenses(expenseData as Transaction[]);
          setIncome(incomeData as Transaction[]);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [user])
  );

  // Calculate totals from expenses and income arrays
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  // Combine and sort transactions
  const allTransactions = [...expenses, ...income]
    .sort((a, b) => {
      // First compare by date
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      
      // If dates are equal, compare by createdAt timestamp
      if (dateComparison === 0 && a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      return dateComparison;
    })
    .slice(0, 5); // Get latest 5 transactions

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatAmount = (amount: number) => {
    return `KES ${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (user?.$id) {
      try {
        const [expenseData, incomeData] = await Promise.all([
          ExpenseDB.listByUser(user.$id),
          IncomeDB.listByUser(user.$id)
        ]);
        setExpenses(expenseData as Transaction[]);
        setIncome(incomeData as Transaction[]);
      } catch (error) {
        console.error('Error refreshing transactions:', error);
      }
    }
    setRefreshing(false);
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Loading...</Text>
        <ActivityIndicator size="large" color="#FFB74D" />
      </View>
    );
  }

  console.log('balance', totalBalance);
  console.log('income', totalIncome);
  console.log('expense', totalExpenses);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header Section */}
      <View className="px-4 pt-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center space-x-3">
            <View className="w-12 h-12 bg-teal-50 rounded-full items-center justify-center">
              <Ionicons name="person" size={24} color="#006D77" />
            </View>
            <View>
              <Text className="text-gray-500 text-sm">Welcome back</Text>
              <Text className="text-xl font-semibold text-gray-900">
                {user?.name || 'User'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/profile')}
            className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
          >
            <Ionicons name="settings-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View className="mt-6 bg-[#006D77] p-6 rounded-2xl">
          <Text className="text-white/80 mb-1">Available Balance</Text>
          <Text className="text-white text-3xl font-bold mb-4">
            {formatAmount(totalBalance)}
          </Text>
          
          <View className="flex-row justify-between">
            <View>
              <Text className="text-white/80 text-sm">Income</Text>
              <Text className="text-white font-semibold">
                {formatAmount(totalIncome)}
              </Text>
            </View>
            <View>
              <Text className="text-white/80 text-sm">Expenses</Text>
              <Text className="text-white font-semibold">
                {formatAmount(totalExpenses)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="mt-6 px-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </Text>
        <View className="flex-row justify-between">
          {QuickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              onPress={() => router.push('/add')}
              className="bg-gray-50 w-[31%] p-4 rounded-xl items-center"
            >
              <View 
                className="w-12 h-12 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text className="text-center text-sm text-gray-600">
                {action.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Budget Section */}
      <View className="mt-6 px-4">
        <View className="bg-gray-50 p-4 rounded-xl">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#006D77] rounded-full items-center justify-center mr-3">
                <Ionicons name="pie-chart" size={20} color="white" />
              </View>
              <View>
                <Text className="text-base font-semibold">Budget Status</Text>
                <Text className="text-sm text-gray-500">Monthly planning</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(budget)/planner')}
            >
              <Text className="text-[#006D77] font-medium">Details</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-gray-500 mb-1">Needs</Text>
              <Text className="text-lg font-semibold text-[#006D77]">50%</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 mb-1">Wants</Text>
              <Text className="text-lg font-semibold text-[#006D77]">30%</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 mb-1">Savings</Text>
              <Text className="text-lg font-semibold text-[#006D77]">20%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <View className="flex-1 mt-6">
        <View className="px-4 flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            Recent Activity
          </Text>
          <TouchableOpacity onPress={() => router.push('/(transactions)/all')}>
            <Text className="text-[#006D77]">See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="px-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {allTransactions.length === 0 ? (
            <View className="py-8 items-center">
              <Image 
                source={require('../../assets/images/logo.png')}
                className="w-32 h-32 mb-4 opacity-50"
              />
              <Text className="text-gray-500 text-center">
                No transactions yet
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/add')}
                className="mt-4 bg-[#006D77] px-6 py-3 rounded-full"
              >
                <Text className="text-white font-medium">Add Transaction</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-3">
              {allTransactions.map(transaction => {
                const category = transaction.category.toLowerCase();
                const iconConfig = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.other;
                const isExpense = expenses.some(exp => exp.$id === transaction.$id);
                
                return (
                  <TransactionItem
                    key={transaction.$id}
                    icon={iconConfig.icon as any}
                    iconBgColor={iconConfig.bgColor}
                    iconColor={iconConfig.color}
                    title={transaction.category}
                    amount={isExpense ? -transaction.amount : transaction.amount}
                    date={formatDate(transaction.date)}
                    onPress={() => router.push(`/(transactions)/${transaction.$id}`)}
                  />
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}