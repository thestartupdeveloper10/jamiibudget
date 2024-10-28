import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// First, create a components/ExpenseCard.tsx
type ExpenseItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  bgColor: string;
  title: string;
  amount: number;
  onPress?: () => void;
};

export default function ExpenseCard() {
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
  ];

  const ExpenseItem = ({ icon, bgColor, title, amount, onPress }: ExpenseItemProps) => (
    <TouchableOpacity 
      onPress={onPress}
      className="mb-3"
    >
      <View className="flex-row justify-between items-center bg-white p-4 rounded-2xl">
        <View className="flex-row items-center space-x-4">
          <View 
            className="w-12 h-12 rounded-full justify-center items-center"
            style={{ backgroundColor: bgColor }}
          >
            <Ionicons name={icon} size={24} color="white" />
          </View>
          <Text className="text-gray-800 text-lg">{title}</Text>
        </View>
        <Text className="text-gray-800 text-lg font-medium">
          ${amount.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="bg-gray-50 rounded-3xl p-4">
      <View className="mb-4">
        <Text className="text-gray-800 text-xl font-semibold">All Expenses</Text>
        <Text className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {expenses.map(expense => (
        <ExpenseItem
          key={expense.id}
          icon={expense.icon as any}
          bgColor={expense.bgColor}
          title={expense.title}
          amount={expense.amount}
          onPress={() => {
            console.log(`Pressed expense: ${expense.title}`);
          }}
        />
      ))}

      <View className="mt-4 pt-4 border-t border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-500">Total Expenses</Text>
          <Text className="text-xl font-bold text-gray-800">
            ${expenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}