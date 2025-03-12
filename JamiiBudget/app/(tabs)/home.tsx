import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
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

export default function Home() {
  const { current: user } = useUser();
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  // Calculate totals
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Loading...</Text>
        <ActivityIndicator size="large" color="#FFB74D" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView className="flex-1 px-4">
        {/* Header Section */}
        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row items-center space-x-3">
            <View className="w-12 h-12 bg-yellow-100 rounded-full justify-center items-center">
              <Ionicons name="person" size={24} color="#FFB74D" />
            </View>
            <Link href='/(tabs)/profile'>
              <View className='px-3'>
                <Text className="text-gray-400 text-sm font-bold">Welcome!</Text>
                <Text className="text-gray-800 text-lg font-bold">{user?.name}</Text>
              </View>
            </Link>
          </View>
          <TouchableOpacity>
            <Link href='(tabs)/profile'>
              <View className="w-10 h-10 bg-gray-50 rounded-full justify-center items-center">
                <Ionicons name="settings-outline" size={20} color="#666" />
              </View>
            </Link>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View className='rounded-md bg-[#351e1a] mt-6 p-4'>
          <View className='flex justify-center items-center'>
            <Text className="text-white text-lg mb-2 font-bold">Total Balance</Text>
            <Text className="text-white text-3xl font-bold">{formatAmount(totalBalance)}</Text>
          </View>

          {/* Income/Expenses Row */}
          <View className="flex-row justify-between mt-6">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-white/20 rounded-full justify-center items-center mr-2">
                <Ionicons name="arrow-down" size={20} color="white" />
              </View>
              <View>
                <Text className="text-white text-sm font-semibold">Income</Text>
                <Text className="text-white font-bold">{formatAmount(totalIncome)}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-white/20 rounded-full justify-center items-center mr-2">
                <Ionicons name="arrow-up" size={20} color="white" />
              </View>
              <View>
                <Text className="text-white text-sm font-semibold">Expenses</Text>
                <Text className="text-white font-bold">{formatAmount(totalExpenses)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transactions Section */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-800 text-lg font-semibold">Latest Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(transactions)/all')}>
              <Text className="text-[#643f38]">View All</Text>
            </TouchableOpacity>
          </View>
          <View className='gap-4'>
            {allTransactions.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">No transactions yet</Text>
            ) : (
              allTransactions.map(transaction => {
                const category = transaction.category.toLowerCase();
                const iconConfig = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.other;
                const isExpense = expenses.some(exp => exp.$id === transaction.$id);
                
                return (
                  <TransactionItem
                    key={transaction.$id}
                    icon={iconConfig.icon}
                    iconBgColor={iconConfig.bgColor}
                    iconColor={iconConfig.color}
                    title={transaction.category}
                    amount={isExpense ? -transaction.amount : transaction.amount}
                    date={formatDate(transaction.date)}
                    onPress={() => router.push(`/(transactions)/${transaction.$id}`)}
                  />
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}