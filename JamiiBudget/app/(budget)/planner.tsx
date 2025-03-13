import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTransactionStore } from '../../contexts/TransactionContext';

const BUDGET_CATEGORIES = {
  needs: {
    title: 'Needs (50%)',
    description: 'Essential expenses',
    color: '#FF6B6B',
    percentage: 0.5,
    icon: 'home',
    items: [
      { name: 'Rent/Mortgage', percentage: 0.25 },
      { name: 'Utilities', percentage: 0.1 },
      { name: 'Groceries', percentage: 0.1 },
      { name: 'Transport', percentage: 0.05 },
    ]
  },
  wants: {
    title: 'Wants (30%)',
    description: 'Lifestyle choices',
    color: '#4ECDC4',
    percentage: 0.3,
    icon: 'game-controller',
    items: [
      { name: 'Entertainment', percentage: 0.1 },
      { name: 'Shopping', percentage: 0.1 },
      { name: 'Dining Out', percentage: 0.1 },
    ]
  },
  savings: {
    title: 'Savings (20%)',
    description: 'Future security',
    color: '#45B7D1',
    percentage: 0.2,
    icon: 'save',
    items: [
      { name: 'Emergency Fund', percentage: 0.1 },
      { name: 'Investments', percentage: 0.05 },
      { name: 'Debt Payment', percentage: 0.05 },
    ]
  }
};

export default function BudgetPlanner() {
  const router = useRouter();
  const { income } = useTransactionStore();
  
  // Calculate monthly income (assuming the most recent income entry is the monthly salary)
  const monthlySalary = income.length > 0 
    ? income.reduce((max, curr) => curr.amount > max ? curr.amount : max, 0)
    : 0;

  const formatAmount = (amount: number) => {
    return `KES ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const BudgetCard = ({ 
    title, 
    description, 
    amount, 
    color, 
    icon, 
    items 
  }: { 
    title: string;
    description: string;
    amount: number;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
    items: { name: string; percentage: number; }[];
  }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <View className="flex-row items-center mb-3">
        <View 
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold">{title}</Text>
          <Text className="text-gray-500">{description}</Text>
        </View>
        <Text className="text-xl font-bold" style={{ color }}>
          {formatAmount(amount)}
        </Text>
      </View>
      
      <View className="space-y-2">
        {items.map((item, index) => (
          <View key={index} className="flex-row justify-between items-center">
            <Text className="text-gray-600">{item.name}</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-800 font-medium mr-2">
                {formatAmount(monthlySalary * item.percentage)}
              </Text>
              <Text className="text-gray-500">({(item.percentage * 100)}%)</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white">
        <View className="flex-row justify-between items-center px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Budget Planner</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Monthly Income Card */}
        <View className="bg-[#351e1a] rounded-xl p-6 mb-6">
          <Text className="text-white text-lg mb-2">Monthly Income</Text>
          <Text className="text-white text-3xl font-bold">
            {formatAmount(monthlySalary)}
          </Text>
        </View>

        {/* Budget Breakdown */}
        {Object.entries(BUDGET_CATEGORIES).map(([key, category]) => (
          <BudgetCard
            key={key}
            title={category.title}
            description={category.description}
            amount={monthlySalary * category.percentage}
            color={category.color}
            icon={category.icon as keyof typeof Ionicons.glyphMap}
            items={category.items}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
} 