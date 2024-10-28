import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function Transactions() {
  const expenses = [
    {
      id: '1',
      icon: 'home',
      bgColor: '#FFB74D',
      title: 'Home Rent',
      amount: -350.00,
    },
    {
      id: '2',
      icon: 'paw',
      bgColor: '#2196F3',
      title: 'Pet Groom',
      amount: -50.00,
    },
    {
      id: '3',
      icon: 'phone-portrait',
      bgColor: '#4CAF50',
      title: 'Recharge',
      amount: -100.00,
    },
    // Add more expense categories as needed
  ];

  // Calculate total expenses
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

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
          <View className="bg-blue-50 p-4 rounded-2xl mb-6">
            <Text className="text-gray-600 text-base font-semibold mb-2">Total Expenses</Text>
            <Text className="text-3xl font-bold  text-gray-900">
              ${Math.abs(totalExpenses).toFixed(2)}
            </Text>
            <Text className="text-gray-500 mt-1 font-semibold">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>

          {/* Expense List */}
          <View className="bg-gray-50 rounded-3xl p-4">
            <View className="mb-4">
              <Text className="text-gray-800 text-xl font-semibold">All Expenses</Text>
            </View>

            {expenses.map(expense => (
              <View 
                key={expense.id}
                className="mb-3 bg-white p-4 rounded-2xl flex-row justify-between items-center"
              >
                <View className="flex-row items-center space-x-4">
                  <View 
                    className="w-12 h-12 rounded-full justify-center items-center"
                    style={{ backgroundColor: expense.bgColor }}
                  >
                    <Ionicons 
                      name={expense.icon as any} 
                      size={24} 
                      color="white" 
                    />
                  </View>
                  <View className='px-4'>
                    <Text className="text-gray-800 text-lg font-bold">{expense.title}</Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-gray-500 text-sm font-semibold">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className="text-red-500 text-lg font-medium">
                  ${Math.abs(expense.amount).toFixed(2)}
                </Text>
              </View>
            ))}

            {/* Monthly Statistics */}
            <View className="mt-6 pt-4 border-t border-gray-200 space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Number of Transactions</Text>
                <Text className="text-lg font-semibold text-gray-800">
                  {expenses.length}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Total Amount</Text>
                <Text className="text-xl font-bold text-red-500">
                  ${Math.abs(totalExpenses).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}