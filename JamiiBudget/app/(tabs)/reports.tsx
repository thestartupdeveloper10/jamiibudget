import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  Platform,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { ExpenseDB, IncomeDB } from '../../lib/appwriteDb';
import { useUser } from '../../contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';
import { useTransactionStore, type TransactionData } from '../../contexts/TransactionContext';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 109, 119, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#006D77'
  }
};

const categoryColors = [
  '#006D77', // Primary
  '#2A9D8F',
  '#E9C46A',
  '#F4A261',
  '#E76F51',
  '#83C5BE',
  '#FFDDD2',
  '#E29578',
  '#006466',
  '#144552',
];

const formatCurrency = (amount: number) => {
  return `KES ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function Reports() {
  const { current: user } = useUser();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { 
    expenses: cachedExpenses, 
    income: cachedIncome, 
    lastFetched, 
    setTransactions,
    shouldRefresh 
  } = useTransactionStore();
  const [expenses, setExpenses] = useState<TransactionData[]>(cachedExpenses);
  const [income, setIncome] = useState<TransactionData[]>(cachedIncome);

  const fetchReportData = useCallback(async () => {
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

      // Update both local and global state
      setTransactions(expensesData, incomeData);
      setExpenses(expensesData);
      setIncome(incomeData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load transaction data');
    } finally {
      setLoading(false);
      useTransactionStore.getState().setShouldRefresh(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (cachedExpenses.length > 0 || cachedIncome.length > 0) {
      setExpenses(cachedExpenses);
      setIncome(cachedIncome);
    }
  }, []);

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
        setLoading(false);
        return;
      }

      fetchReportData();
    }, [user, fetchReportData, cachedExpenses, cachedIncome, lastFetched, shouldRefresh])
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReportData().finally(() => setRefreshing(false));
  }, [fetchReportData]);

  // Prepare monthly data
  const getMonthlyData = () => {
    const monthLabels: string[] = [];
    const expenseData: number[] = [];
    const incomeData: number[] = [];
    
    // Get the first day of current month
    const currentDate = new Date();
    currentDate.setDate(1);
    
    // Create a map to store aggregated data
    const monthlyExpenses = new Map<string, number>();
    const monthlyIncome = new Map<string, number>();
    
    // Aggregate expenses by month
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyExpenses.set(monthYear, (monthlyExpenses.get(monthYear) || 0) + expense.amount);
    });
    
    // Aggregate income by month
    income.forEach(inc => {
      const date = new Date(inc.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyIncome.set(monthYear, (monthlyIncome.get(monthYear) || 0) + inc.amount);
    });
    
    // Get last 6 months in reverse chronological order
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Add month label and data in reverse order
      monthLabels.unshift(date.toLocaleDateString('en-US', { month: 'short' }));
      expenseData.unshift(monthlyExpenses.get(monthYear) || 0);
      incomeData.unshift(monthlyIncome.get(monthYear) || 0);
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

    return Object.entries(categoryTotals).map(([name, amount], index) => ({
      name,
      amount,
      color: categoryColors[index % categoryColors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };

  const generatePDFContent = () => {
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const { monthLabels, expenseData, incomeData } = getMonthlyData();
    const categoryData = getCategoryData();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Financial Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              color: #333;
            }
            .section { 
              margin-bottom: 30px;
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .summary-box { 
              border: 1px solid #ddd; 
              padding: 15px; 
              border-radius: 8px;
              margin-bottom: 20px;
              background: #f9f9f9;
            }
            .flex-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 8px 0;
            }
            .income { color: #4CAF50; font-weight: bold; }
            .expense { color: #F44336; font-weight: bold; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              background: white;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th { 
              background-color: #f5f5f5;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Financial Report</h1>
            <p>Generated on ${formatDate(new Date())}</p>
          </div>

          <div class="section">
            <h2>Summary</h2>
            <div class="summary-box">
              <div class="flex-row">
                <span>Total Income:</span>
                <span class="income">${formatCurrency(totalIncome)}</span>
              </div>
              <div class="flex-row">
                <span>Total Expenses:</span>
                <span class="expense">${formatCurrency(totalExpenses)}</span>
              </div>
              <div class="flex-row" style="border-top: 1px solid #ddd; padding-top: 10px;">
                <span>Net Savings:</span>
                <span style="font-weight: bold;">${formatCurrency(netSavings)}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Expense Categories</h2>
            <table>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Percentage</th>
              </tr>
              ${categoryData.map(cat => `
                <tr>
                  <td style="text-transform: capitalize;">${cat.name}</td>
                  <td>${formatCurrency(cat.amount)}</td>
                  <td>${((cat.amount / totalExpenses) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="section">
            <h2>Monthly Transactions</h2>
            <table>
              <tr>
                <th>Month</th>
                <th>Income</th>
                <th>Expenses</th>
                <th>Net</th>
              </tr>
              ${monthLabels.map((month, index) => `
                <tr>
                  <td>${month}</td>
                  <td class="income">${formatCurrency(incomeData[index])}</td>
                  <td class="expense">${formatCurrency(expenseData[index])}</td>
                  <td>${formatCurrency(incomeData[index] - expenseData[index])}</td>
                </tr>
              `).join('')}
            </table>
          </div>

          <div class="section">
            <h2>Recent Transactions</h2>
            <table>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
              ${[...expenses, ...income]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map(transaction => `
                  <tr>
                    <td>${formatDate(new Date(transaction.date))}</td>
                    <td style="text-transform: capitalize;">${transaction.category}</td>
                    <td>${formatCurrency(transaction.amount)}</td>
                    <td>${expenses.includes(transaction) ? 'Expense' : 'Income'}</td>
                  </tr>
                `).join('')}
            </table>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Generate PDF file
      const { uri } = await Print.printToFileAsync({
        html: generatePDFContent(),
        base64: false
      });

      // Share the PDF
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf'
      });

      Alert.alert(
        'Success',
        'Report has been downloaded successfully!'
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Error',
        'Failed to generate report. Please try again.'
      );
    } finally {
      setDownloading(false);
    }
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
      <View className="px-4 pt-6 pb-4 border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">Reports</Text>
          <TouchableOpacity 
            onPress={handleDownload}
            disabled={downloading || expenses.length === 0}
            className={`flex-row items-center px-4 py-2 rounded-full ${
              downloading || expenses.length === 0 ? 'bg-gray-200' : 'bg-[#006D77]'
            }`}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={20} color="white" />
                <Text className="text-white ml-2 font-medium">Export PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#006D77']} />
        }
      >
        {expenses.length === 0 && income.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="analytics-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 text-center text-lg mb-2">No Data Available</Text>
            <Text className="text-gray-400 text-center px-8">
              Start adding transactions to see your financial reports
            </Text>
          </View>
        ) : (
          <View className="p-4">
            {/* Summary Cards */}
            <View className="flex-row gap-4 mb-6">
              <View className="flex-1 bg-green-50 p-4 rounded-2xl">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-2">
                  <Ionicons name="arrow-up" size={20} color="#4CAF50" />
                </View>
                <Text className="text-gray-600 text-sm">Total Income</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {formatCurrency(income.reduce((sum, i) => sum + i.amount, 0))}
                </Text>
              </View>
              
              <View className="flex-1 bg-red-50 p-4 rounded-2xl">
                <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mb-2">
                  <Ionicons name="arrow-down" size={20} color="#F44336" />
                </View>
                <Text className="text-gray-600 text-sm">Total Expenses</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
                </Text>
              </View>
            </View>

            {/* Monthly Overview Chart */}
            <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
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
                  legend: ['Expenses', 'Income']
                }}
                width={screenWidth - 48}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </View>

            {/* Expense Categories */}
            {categoryData.length > 0 && (
              <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
                <Text className="text-lg font-semibold mb-4">Expense Breakdown</Text>
                <PieChart
                  data={categoryData.map((item, index) => ({
                    ...item,
                    color: categoryColors[index % categoryColors.length]
                  }))}
                  width={screenWidth - 48}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
                
                {/* Category Legend */}
                <View className="mt-4 space-y-2">
                  {categoryData.map((cat, index) => (
                    <View key={cat.name} className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View 
                          style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                          className="w-3 h-3 rounded-full mr-2"
                        />
                        <Text className="text-gray-700 capitalize">{cat.name}</Text>
                      </View>
                      <Text className="text-gray-600">
                        {((cat.amount / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Monthly Comparison */}
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-lg font-semibold mb-4">Monthly Expenses</Text>
              <BarChart
                data={{
                  labels: monthLabels,
                  datasets: [{ data: expenseData }]
                }}
                width={screenWidth - 48}
                height={220}
                yAxisLabel="KES "
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(0, 109, 119, ${opacity})`
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}