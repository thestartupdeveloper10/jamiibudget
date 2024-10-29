import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseDB, IncomeDB } from '../../lib/appwriteDb';
import { useUser } from '../../contexts/UserContext';

// Define a type for our transactions based on your database structure
type TransactionData = {
  $id?: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt?: string;
};

// Category icon mappings
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

export default function Transactions() {
  const { current: user } = useUser();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<TransactionData[]>([]);
  const [income, setIncome] = useState<TransactionData[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.$id) {
        setExpenses([]);
        setIncome([]);
        setLoading(false);
        return;
      }

      try {
        // Get current month's date range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

        // Fetch both expenses and income for the current month
        const [expensesData, incomeData] = await Promise.all([
          ExpenseDB.getByDateRange(user.$id, startOfMonth, endOfMonth),
          IncomeDB.getByDateRange(user.$id, startOfMonth, endOfMonth)
        ]);

        setExpenses(expensesData);
        setIncome(incomeData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  // Combine and sort transactions
  const allTransactions = [...expenses, ...income].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate totals
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = income.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  const formatAmount = (amount: number) => {
    return `KES ${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

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

      <ScrollView className="flex-1">
        {/* Summary Card */}
        <View className="p-4">
          <View className="bg-[#8e5347] p-4 rounded-2xl mb-6 justify-center items-center">
            <Text className="text-white text-base font-semibold mb-2">Total Balance</Text>
            <Text className="text-3xl font-bold text-white">
              {formatAmount(totalBalance)}
            </Text>
            <Text className="mt-1 font-semibold text-white">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>

          {/* Transaction List */}
          <View className="bg-gray-50 rounded-3xl p-4">
            <View className="mb-4">
              <Text className="text-gray-800 text-xl font-semibold">All Transactions</Text>
            </View>

            {allTransactions.length === 0 ? (
              <Text className="text-gray-500 text-center py-4">
                No transactions for this month
              </Text>
            ) : (
              allTransactions.map(transaction => {
                const category = transaction.category.toLowerCase();
                const iconConfig = categoryIcons[category] || categoryIcons.other;
                const isExpense = expenses.some(exp => exp.$id === transaction.$id);
                
                return (
                  <View 
                    key={transaction.$id}
                    className="mb-3 bg-white p-4 rounded-2xl flex-column justify-between"
                  >
                    <View className="flex-row items-center space-x-4">
                      <View 
                        className="w-12 h-12 rounded-full gap-3 justify-center items-center"
                        style={{ backgroundColor: iconConfig.bgColor }}
                      >
                        <Ionicons 
                          name={iconConfig.icon} 
                          size={24} 
                          color="white" 
                        />
                      </View>
                      <View className='px-4'>
                        <Text className="text-gray-800 text-lg font-bold capitalize">
                          {transaction.category}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-gray-500 text-sm font-semibold">
                            {formatDate(transaction.date)}
                          </Text>
                          {transaction.description && (
                            <Text className="text-gray-400 text-sm ml-2" numberOfLines={1}>
                              • {transaction.description}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                    <Text 
                      className={`text-lg font-medium ${
                        isExpense ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {isExpense ? '-' : '+'}{formatAmount(transaction.amount)}
                    </Text>
                  </View>
                );
              })
            )}

            {/* Monthly Statistics */}
            <View className="mt-6 pt-4 border-t border-gray-200 space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Number of Transactions</Text>
                <Text className="text-lg font-semibold text-[#aa6558]">
                  {allTransactions.length}
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
              <View className="flex-row justify-between items-center">
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