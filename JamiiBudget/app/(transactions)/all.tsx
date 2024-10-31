import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ExpenseDB, IncomeDB } from '../../lib/appwriteDb';
import { useUser } from '../../contexts/UserContext';
import TransactionItem from '../../components/TransactionItem';

type Transaction = {
  $id?: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt?: string;
};

// Reuse your existing categoryIcons configuration
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

export default function AllTransactions() {
  const router = useRouter();
  const { current: user } = useUser();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [income, setIncome] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.$id) return;

      try {
        const [expenseData, incomeData] = await Promise.all([
          ExpenseDB.listByUser(user.$id),
          IncomeDB.listByUser(user.$id)
        ]);

        setExpenses(expenseData);
        setIncome(incomeData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  // Combine and sort all transactions
  const allTransactions = [...expenses, ...income]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#351e1a" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mr-4"
        >
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">All Transactions</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {allTransactions.length === 0 ? (
          <Text className="text-gray-500 text-center py-8">No transactions found</Text>
        ) : (
          <View className="py-4 space-y-3">
            {allTransactions.map(transaction => {
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
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}