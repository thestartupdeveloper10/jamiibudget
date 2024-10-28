import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TransactionItem from '../../components/TransactionItem';
import { Link } from 'expo-router';

// Sample transaction data
const transactions = [
  {
    id: '1',
    icon: 'fast-food',
    iconBgColor: '#FFF3E0',
    iconColor: '#FFB74D',
    title: 'Food',
    amount: -45.00,
    date: 'Today'
  },
  {
    id: '2',
    icon: 'car',
    iconBgColor: '#E8F5E9',
    iconColor: '#66BB6A',
    title: 'Transport',
    amount: -32.50,
    date: 'Today'
  },
  {
    id: '3',
    icon: 'wallet',
    iconBgColor: '#E3F2FD',
    iconColor: '#42A5F5',
    title: 'Salary',
    amount: 2500.00,
    date: 'Yesterday'
  },
  {
    id: '4',
    icon: 'cart',
    iconBgColor: '#E3F2FD',
    iconColor: '#42A5F5',
    title: 'Shopping',
    amount: -2500.00,
    date: 'Yesterday'
  },
  {
    id: '5',
    icon: 'game-controller',
    iconBgColor: '#E3F2FD',
    iconColor: '#9C27B0',
    title: 'Entertainment',
    amount: -200.00,
    date: 'Yesterday'
  },
  {
    id: '6',
    icon: 'laptop',
    iconBgColor: '#E3F2FD',
    iconColor: '#3F51B5',
    title: 'Freelance',
    amount: 4000.00,
    date: 'Yesterday'
  },
  // Add more transactions as needed
];

export default function Home() {
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
            <View className='px-3'>
              <Text className="text-gray-400 text-sm font-bold">Welcome!</Text>
              <Text className="text-gray-800 text-lg font-bold">John Doe</Text>
            </View>
          </View>
          <TouchableOpacity>
            <View className="w-10 h-10 bg-gray-50 rounded-full justify-center items-center">
              <Ionicons name="settings-outline" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#60A5FA', '#E879F9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="mt-6 p-4 rounded-3xl"
        >
          <View className='flex justify-center items-center'>
            <Text className="text-white text-lg mb-2 font-bold">Total Balance</Text>
            <Text className="text-white text-3xl font-bold">$ 4800.00</Text>
          </View>

          {/* Income/Expenses Row */}
          <View className="flex-row justify-between mt-6">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-white/20 rounded-full justify-center items-center mr-2">
                <Ionicons name="arrow-down" size={20} color="white" />
              </View>
              <View>
                <Text className="text-white text-sm font-semibold">Income</Text>
                <Text className="text-white font-bold">2,500.000</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-white/20 rounded-full justify-center items-center mr-2">
                <Ionicons name="arrow-up" size={20} color="white" />
              </View>
              <View>
                <Text className="text-white text-sm font-semibold">Expenses</Text>
                <Text className="text-white font-bold">800.00</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Transactions Section */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-800 text-lg font-semibold">Latest Transactions</Text>
            <TouchableOpacity>
              <Text className="text-blue-500">View All</Text>
            </TouchableOpacity>
          </View>
            <View className='gap-4'>
          {/* Transaction List */}
          {transactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              icon={transaction.icon as any}
              iconBgColor={transaction.iconBgColor}
              iconColor={transaction.iconColor}
              title={transaction.title}
              amount={transaction.amount}
              date={transaction.date}
              onPress={() => {
                // Handle transaction press
                console.log(`Pressed transaction: ${transaction.title}`);
              }}
            />
          ))}
          </View>
        </View>
        <Link href={'/(auth)/signIn'}>Login</Link>
      </ScrollView>
    </SafeAreaView>
  );
}