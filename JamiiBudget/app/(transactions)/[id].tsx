import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ExpenseDB, IncomeDB } from '../../lib/appwriteDb';
import { useUser } from '../../contexts/UserContext';

type Transaction = {
  $id?: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
};

export default function TransactionDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { current: user } = useUser();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isExpense, setIsExpense] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!user?.$id || !id) return;

      try {
        // Try to find in expenses first
        let foundTransaction = (await ExpenseDB.listByUser(user.$id))
          .find(t => t.$id === id);

        if (foundTransaction) {
          setIsExpense(true);
        } else {
          // If not found in expenses, check income
          foundTransaction = (await IncomeDB.listByUser(user.$id))
            .find(t => t.$id === id);
          setIsExpense(false);
        }

        setTransaction(foundTransaction || null);
      } catch (error) {
        console.error('Error fetching transaction:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, user]);

  const formatAmount = (amount: number) => {
    return `KES ${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#351e1a" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="px-4 py-4 flex-row items-center border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Transaction Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Transaction Details</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <View className="bg-gray-50 rounded-2xl p-6 space-y-6">
          {/* Amount */}
          <View className="items-center">
            <Text className="text-gray-500 mb-2">Amount</Text>
            <Text className={`text-3xl font-bold ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
              {isExpense ? '-' : '+'}{formatAmount(transaction.amount)}
            </Text>
          </View>

          {/* Category */}
          <View className="border-t border-gray-200 pt-4">
            <Text className="text-gray-500 mb-2">Category</Text>
            <Text className="text-lg font-semibold capitalize">{transaction.category}</Text>
          </View>

          {/* Description */}
          {transaction.description && (
            <View className="border-t border-gray-200 pt-4">
              <Text className="text-gray-500 mb-2">Description</Text>
              <Text className="text-lg">{transaction.description}</Text>
            </View>
          )}

          {/* Date */}
          <View className="border-t border-gray-200 pt-4">
            <Text className="text-gray-500 mb-2">Date</Text>
            <Text className="text-lg">
              {new Date(transaction.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}