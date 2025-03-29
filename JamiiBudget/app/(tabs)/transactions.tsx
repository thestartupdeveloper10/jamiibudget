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
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-4 pt-4 pb-2 bg-white">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-semibold text-gray-900">Transactions</Text>
          <TouchableOpacity 
            className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
          >
            <Ionicons name="search-outline" size={22} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#006D77']}
          />
        }
      >
        {/* Summary Cards */}
        <View className="p-4">
          <View className="flex-row gap-4 mb-6">
            {/* Income Card */}
            <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="arrow-up" size={20} color="#4CAF50" />
              </View>
              <Text className="text-gray-500 text-sm">Income</Text>
              <Text className="text-lg font-semibold text-gray-900">
                {formatAmount(totalIncome)}
              </Text>
            </View>
            
            {/* Expense Card */}
            <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm">
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="arrow-down" size={20} color="#FF5252" />
              </View>
              <Text className="text-gray-500 text-sm">Expenses</Text>
              <Text className="text-lg font-semibold text-gray-900">
                {formatAmount(totalExpenses)}
              </Text>
            </View>
          </View>

          {/* Balance Card */}
          <View className="bg-[#006D77] p-6 rounded-2xl mb-6">
            <Text className="text-white/80 text-sm mb-1">Total Balance</Text>
            <Text className="text-3xl font-bold text-white mb-1">
              {formatAmount(totalBalance)}
            </Text>
            <Text className="text-white/80 text-sm">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>

          {/* Expense Categories */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Expense Categories
              </Text>
              <Text className="text-[#006D77] font-medium">
                {formatAmount(totalExpenses)}
              </Text>
            </View>
            
            {Object.entries(expenseTotals).length === 0 ? (
              <Text className="text-gray-500 text-center py-4">
                No expenses recorded
              </Text>
            ) : (
              <View className="space-y-4">
                {Object.entries(expenseTotals)
                  .sort(([,a], [,b]) => b.amount - a.amount)
                  .map(([category, data]) => (
                    <View key={category} className="flex-row items-center py-2 justify-between">
                      <View className="flex-row items-center  flex-1">
                        <View 
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: `${categoryIcons[category]?.bgColor}15` }}
                        >
                          <Ionicons 
                            name={categoryIcons[category]?.icon || 'grid'} 
                            size={20} 
                            color={categoryIcons[category]?.bgColor} 
                          />
                        </View>
                        <View>
                          <Text className="text-gray-700 font-medium capitalize">
                            {category}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {data.count} transactions
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-gray-700 font-medium">
                          {formatAmount(data.amount)}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {data.percentage?.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  ))
                }
              </View>
            )}
          </View>

          {/* Income Categories */}
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Income Categories
              </Text>
              <Text className="text-[#006D77] font-medium">
                {formatAmount(totalIncome)}
              </Text>
            </View>
            
            {Object.entries(incomeTotals).length === 0 ? (
              <Text className="text-gray-500 text-center py-4">
                No income recorded
              </Text>
            ) : (
              <View className="space-y-4">
                {Object.entries(incomeTotals)
                  .sort(([,a], [,b]) => b.amount - a.amount)
                  .map(([category, data]) => (
                    <View key={category} className="flex-row py-2 items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View 
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: `${categoryIcons[category]?.bgColor}15` }}
                        >
                          <Ionicons 
                            name={categoryIcons[category]?.icon || 'grid'} 
                            size={20} 
                            color={categoryIcons[category]?.bgColor} 
                          />
                        </View>
                        <View>
                          <Text className="text-gray-700 font-medium capitalize">
                            {category}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {data.count} transactions
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-gray-700 font-medium">
                          {formatAmount(data.amount)}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {data.percentage?.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  ))
                }
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
