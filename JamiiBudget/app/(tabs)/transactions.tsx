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
      title: 'Rent',
      amount: -350.00,
    },
    {
      id: '2',
      icon: 'fast-food',
      bgColor: '#702963',
      title: 'Food',
      amount: -50.00,
    },
    {
      id: '3',
      icon: 'car',
      bgColor: '#4CAF50',
      title: 'Transport',
      amount: -100.00,
    },
    {
      id: '4',
      icon: 'cart',
      bgColor: '#42A5F5',
      title: 'Shopping',
      amount: 2500.00,
    },
    {
      id: '5',
      icon: 'game-controller',
      bgColor: '#9C27B0',
      title: 'Entertainment',
      amount: 200.00,
    },
    {
      id: '6',
      icon: 'grid',
      bgColor: 'blue',
      title: 'Others',
      amount: 500.00,
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
          <View className="bg-[#8e5347] p-4 rounded-2xl mb-6 justify-center items-center">
            <Text className="text-white text-base font-semibold mb-2">Total Expenses</Text>
            <Text className="text-3xl font-bold  text-white">
              Ksh: {Math.abs(totalExpenses).toFixed(2)}
            </Text>
            <Text className="mt-1 font-semibold text-white">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>

          {/* Expense List */}
          <View className="bg-gray-50 rounded-3xl p-4">
            <View className="mb-4">
              <Text className="text-gray-800 text-xl font-semibold">All Total Expenses</Text>
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
                <Text className="text-red-900 text-lg font-medium">
                  Ksh: {Math.abs(expense.amount).toFixed(2)}
                </Text>
              </View>
            ))}

            {/* Monthly Statistics */}
            <View className="mt-6 pt-4 border-t border-gray-200 space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Number of Transactions</Text>
                <Text className="text-lg font-semibold text-[#aa6558]">
                  {expenses.length}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-500">Total Amount</Text>
                <Text className="text-xl font-bold text-[#643f38]">
                  Ksh: {Math.abs(totalExpenses).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}