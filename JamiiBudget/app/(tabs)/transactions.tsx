import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ExpenseDB, IncomeDB } from '../../lib/appwriteDb';
import { useUser } from '../../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTransactionStore, type TransactionData, type CategoryTotals } from '../../contexts/TransactionContext';

// Category icon and color mappings
const categoryIcons: Record<string, { icon: keyof typeof Ionicons.glyphMap; bgColor: string }> = {
  food: { icon: 'fast-food', bgColor: '#702963' },
  shopping: { icon: 'cart', bgColor: '#42A5F5' },
  transport: { icon: 'car', bgColor: '#4CAF50' },
  bills: { icon: 'receipt', bgColor: '#FFB74D' },
  entertainment: { icon: 'game-controller', bgColor: '#9C27B0' },
  education: { icon: 'book', bgColor: '#FF7043' },
  salary: { icon: 'wallet', bgColor: '#009688' },
  freelance: { icon: 'laptop', bgColor: '#3F51B5' },
  investment: { icon: 'trending-up', bgColor: '#607D8B' },
  business: { icon: 'business', bgColor: '#795548' },
  other: { icon: 'grid', bgColor: 'blue' }
};

// Utility function for formatting amounts
const formatAmount = (amount: number) => {
  return `KES ${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Component for rendering a category row
const CategoryRow = ({ 
  category, 
  data, 
  type 
}: { 
  category: string; 
  data: { amount: number; count: number; percentage?: number }; 
  type: 'expense' | 'income' 
}) => {
  const iconConfig = categoryIcons[category] || categoryIcons.other;
  const amountColor = type === 'expense' ? 'text-red-500' : 'text-green-500';

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
      <View className="flex-row items-center flex-1">
        <View 
          className="w-10 h-10 rounded-full justify-center items-center mr-3"
          style={{ backgroundColor: iconConfig.bgColor }}
        >
          <Ionicons name={iconConfig.icon} size={20} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-800 font-medium capitalize">{category}</Text>
          <View className="flex-row items-center">
            <Text className="text-gray-500 text-sm">{data.count} transactions</Text>
            {data.percentage && (
              <Text className="text-gray-500 text-sm ml-2">({data.percentage.toFixed(1)}%)</Text>
            )}
          </View>
        </View>
      </View>
      <Text className={`font-medium ${amountColor}`}>
        {formatAmount(data.amount)}
      </Text>
    </View>
  );
};

export default function TransactionsScreen() {
  const router = useRouter();
  const { current: user } = useUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { 
    expenses: cachedExpenses, 
    income: cachedIncome, 
    lastFetched, 
    setTransactions,
    shouldRefresh 
  } = useTransactionStore();
  const [expenses, setExpenses] = useState<TransactionData[]>(cachedExpenses);
  const [income, setIncome] = useState<TransactionData[]>(cachedIncome);
  const [expenseTotals, setExpenseTotals] = useState<CategoryTotals>({});
  const [incomeTotals, setIncomeTotals] = useState<CategoryTotals>({});

  // Initialize with cached data
  useEffect(() => {
    if (cachedExpenses.length > 0 || cachedIncome.length > 0) {
      setExpenses(cachedExpenses);
      setIncome(cachedIncome);
      calculateCategoryTotals(cachedExpenses, cachedIncome);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!user?.$id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [expensesData, incomeData] = await Promise.all([
        ExpenseDB.listByUser(user.$id),
        IncomeDB.listByUser(user.$id)
      ]);

      // Update both local state and global store
      setTransactions(expensesData, incomeData);
      setExpenses(expensesData);
      setIncome(incomeData);
      calculateCategoryTotals(expensesData, incomeData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      useTransactionStore.getState().setShouldRefresh(false);
    }
  }, [user, calculateCategoryTotals]);

  useFocusEffect(
    useCallback(() => {
      if (!user?.$id) {
        setLoading(false);
        return;
      }

      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      const cacheExpired = !lastFetched || Date.now() - lastFetched > CACHE_DURATION;

      if (!shouldRefresh && !cacheExpired && (cachedExpenses.length > 0 || cachedIncome.length > 0)) {
        // Use cached data
        setExpenses(cachedExpenses);
        setIncome(cachedIncome);
        calculateCategoryTotals(cachedExpenses, cachedIncome);
        setLoading(false);
        return;
      }

      fetchTransactions();
    }, [user, fetchTransactions, cachedExpenses, cachedIncome, lastFetched, shouldRefresh])
  );

  const calculateCategoryTotals = (expensesData: TransactionData[], incomeData: TransactionData[]) => {
    // Calculate totals for expenses
    const totalExpenseAmount = expensesData.reduce((sum, t) => sum + t.amount, 0);
    const expenseSums = expensesData.reduce((acc, transaction) => {
      const category = transaction.category.toLowerCase();
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0 };
      }
      acc[category].amount += transaction.amount;
      acc[category].count += 1;
      acc[category].percentage = (acc[category].amount / totalExpenseAmount) * 100;
      return acc;
    }, {} as CategoryTotals);

    // Calculate totals for income
    const totalIncomeAmount = incomeData.reduce((sum, t) => sum + t.amount, 0);
    const incomeSums = incomeData.reduce((acc, transaction) => {
      const category = transaction.category.toLowerCase();
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0 };
      }
      acc[category].amount += transaction.amount;
      acc[category].count += 1;
      acc[category].percentage = (acc[category].amount / totalIncomeAmount) * 100;
      return acc;
    }, {} as CategoryTotals);

    setExpenseTotals(expenseSums);
    setIncomeTotals(incomeSums);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, [fetchTransactions]);

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8e5347" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-4 py-6 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-800">Transactions</Text>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8e5347']}
          />
        }
      >
        {/* Summary Card */}
        <View className="p-4">
          <View className="bg-[#8e5347] p-4 rounded-2xl mb-6">
            <Text className="text-white text-base text-center font-semibold mb-2">
              Total Balance
            </Text>
            <Text className="text-3xl text-center font-bold text-white">
              {formatAmount(totalBalance)}
            </Text>
            <Text className="mt-1 text-center font-semibold text-white">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>

          {/* Expense Categories */}
          <View className="bg-gray-50 rounded-3xl p-4 mb-6">
            <Text className="text-gray-800 text-xl font-semibold mb-4">
              Expense Categories
            </Text>
            {Object.entries(expenseTotals).length === 0 ? (
              <Text className="text-gray-500 text-center py-2">
                No expenses this month
              </Text>
            ) : (
              Object.entries(expenseTotals)
                .sort(([,a], [,b]) => b.amount - a.amount)
                .map(([category, data]) => (
                  <CategoryRow 
                    key={category}
                    category={category}
                    data={data}
                    type="expense"
                  />
                ))
            )}
          </View>

          {/* Income Categories */}
          <View className="bg-gray-50 rounded-3xl p-4 mb-6">
            <Text className="text-gray-800 text-xl font-semibold mb-4">
              Income Categories
            </Text>
            {Object.entries(incomeTotals).length === 0 ? (
              <Text className="text-gray-500 text-center py-2">
                No income this month
              </Text>
            ) : (
              Object.entries(incomeTotals)
                .sort(([,a], [,b]) => b.amount - a.amount)
                .map(([category, data]) => (
                  <CategoryRow 
                    key={category}
                    category={category}
                    data={data}
                    type="income"
                  />
                ))
            )}
          </View>

          {/* Monthly Summary */}
          <View className="bg-gray-50 rounded-3xl p-4">
            <Text className="text-gray-800 text-xl font-semibold mb-4">
              Monthly Summary
            </Text>
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Total Transactions</Text>
                <Text className="text-lg font-semibold text-[#aa6558]">
                  {expenses.length + income.length}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Total Income</Text>
                <Text className="text-lg font-semibold text-green-500">
                  {formatAmount(totalIncome)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Total Expenses</Text>
                <Text className="text-lg font-semibold text-red-500">
                  {formatAmount(totalExpenses)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
                <Text className="text-gray-500">Net Balance</Text>
                <Text className="text-xl font-bold text-[#643f38]">
                  {formatAmount(totalBalance)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
