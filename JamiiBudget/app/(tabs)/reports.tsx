import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { ExpenseDB, IncomeDB } from '../../lib/appwriteDb';
import { useUser } from '../../contexts/UserContext';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(142, 83, 71, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  decimalPlaces: 0,
  useShadowColorFromDataset: false,
};

type TransactionData = {
  $id?: string;
  userId: string;
  amount: number;
  category: string;
  date: string;
};

export default function Reports() {
  const { current: user } = useUser();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<TransactionData[]>([]);
  const [income, setIncome] = useState<TransactionData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.$id) {
        setLoading(false);
        return;
      }

      try {
        // Get last 6 months of data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        const [expensesData, incomeData] = await Promise.all([
          ExpenseDB.getByDateRange(user.$id, startDate.toISOString(), endDate.toISOString()),
          IncomeDB.getByDateRange(user.$id, startDate.toISOString(), endDate.toISOString())
        ]);

        setExpenses(expensesData);
        setIncome(incomeData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Prepare monthly data
  const getMonthlyData = () => {
    const monthLabels = [];
    const expenseData = [];
    const incomeData = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short' });
      monthLabels.unshift(monthYear);

      const monthExpenses = expenses
        .filter(e => new Date(e.date).getMonth() === date.getMonth())
        .reduce((sum, e) => sum + e.amount, 0);

      const monthIncome = income
        .filter(e => new Date(e.date).getMonth() === date.getMonth())
        .reduce((sum, e) => sum + e.amount, 0);

      expenseData.unshift(monthExpenses);
      incomeData.unshift(monthIncome);
    }

    return { monthLabels, expenseData, incomeData };
  };

  // Prepare category data for pie chart
  const getCategoryData = () => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category.toLowerCase();
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      '#FF9800', '#2196F3', '#4CAF50', '#F44336', '#9C27B0',
      '#795548', '#607D8B', '#E91E63', '#9E9E9E'
    ];

    return Object.entries(categoryTotals).map(([name, amount], index) => ({
      name,
      amount,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };

  const { monthLabels, expenseData, incomeData } = getMonthlyData();
  const categoryData = getCategoryData();

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
        <Text className="text-2xl font-bold text-gray-800">Financial Reports</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Monthly Overview */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-4">Monthly Overview</Text>
          <LineChart
            data={{
              labels: monthLabels,
              datasets: [
                {
                  data: expenseData,
                  color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: incomeData,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
              legend: ['Expenses', 'Income'],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        {/* Expense by Category */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-4">Expenses by Category</Text>
          <PieChart
            data={categoryData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
            absolute
          />
        </View>

        {/* Monthly Comparison */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-4">Income vs Expenses</Text>
          <BarChart
            data={{
              labels: monthLabels,
              datasets: [
                {
                  data: expenseData,
                },
              ],
            }}
            width={screenWidth - 32}
            height={220}
            yAxisLabel="KES "
            chartConfig={chartConfig}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        {/* Summary Statistics */}
        <View className="bg-gray-50 p-4 rounded-xl mb-8">
          <Text className="text-lg font-semibold mb-4">Summary</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Income</Text>
              <Text className="font-semibold text-green-600">
                KES {income.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Expenses</Text>
              <Text className="font-semibold text-red-600">
                KES {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-gray-200">
              <Text className="text-gray-600">Net Savings</Text>
              <Text className="font-semibold text-[#8e5347]">
                KES {(
                  income.reduce((sum, i) => sum + i.amount, 0) -
                  expenses.reduce((sum, e) => sum + e.amount, 0)
                ).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}