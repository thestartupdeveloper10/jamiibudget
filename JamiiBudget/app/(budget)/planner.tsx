import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTransactionStore } from '../../contexts/TransactionContext';

const BUDGET_CATEGORIES = {
  needs: {
    title: 'Essential Needs',
    subtitle: '50% of Income',
    description: 'Basic living expenses that you must pay',
    color: '#006D77',
    percentage: 0.5,
    icon: 'home-outline',
    items: [
      { name: 'Housing', percentage: 0.25, icon: 'home-outline' },
      { name: 'Utilities', percentage: 0.1, icon: 'flash-outline' },
      { name: 'Groceries', percentage: 0.1, icon: 'cart-outline' },
      { name: 'Transport', percentage: 0.05, icon: 'car-outline' },
    ]
  },
  wants: {
    title: 'Lifestyle',
    subtitle: '30% of Income',
    description: 'Non-essential but important expenses',
    color: '#2A9D8F',
    percentage: 0.3,
    icon: 'heart-outline',
    items: [
      { name: 'Entertainment', percentage: 0.1, icon: 'game-controller-outline' },
      { name: 'Shopping', percentage: 0.1, icon: 'bag-outline' },
      { name: 'Dining Out', percentage: 0.1, icon: 'restaurant-outline' },
    ]
  },
  savings: {
    title: 'Financial Goals',
    subtitle: '20% of Income',
    description: 'Saving and investing for the future',
    color: '#E9C46A',
    percentage: 0.2,
    icon: 'trending-up-outline',
    items: [
      { name: 'Emergency Fund', percentage: 0.1, icon: 'shield-outline' },
      { name: 'Investments', percentage: 0.05, icon: 'bar-chart-outline' },
      { name: 'Debt Payment', percentage: 0.05, icon: 'cash-outline' },
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
    subtitle, 
    description, 
    amount, 
    color, 
    icon, 
    items 
  }: { 
    title: string;
    subtitle: string;
    description: string;
    amount: number;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
    items: { name: string; percentage: number; icon: keyof typeof Ionicons.glyphMap; }[];
  }) => (
    <View className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-center mb-2">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${color}15` }}
          >
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{title}</Text>
            <Text className="text-gray-500 text-sm">{subtitle}</Text>
          </View>
          <Text className="text-xl font-bold" style={{ color }}>
            {formatAmount(amount)}
          </Text>
        </View>
        <Text className="text-gray-500 text-sm">{description}</Text>
      </View>
      
      <View className="divide-y divide-gray-100">
        {items.map((item, index) => (
          <View key={index} className="flex-row items-center p-4">
            <View 
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${color}10` }}
            >
              <Ionicons name={item.icon} size={20} color={color} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-medium">{item.name}</Text>
              <Text className="text-gray-500 text-sm">
                {(item.percentage * 100)}% • {formatAmount(monthlySalary * item.percentage)}
              </Text>
            </View>
            <View 
              className="h-2 w-24 rounded-full bg-gray-100 overflow-hidden"
              style={{ backgroundColor: `${color}15` }}
            >
              <View 
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: color,
                  width: `${(item.percentage / 0.5) * 100}%`
                }}
              />
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
      <View className="bg-white border-b border-gray-100">
        <View className="flex-row justify-between items-center px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900">Budget Planner</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Monthly Income Card */}
        <View className="bg-[#006D77] rounded-2xl p-6 mb-6">
          <View className="flex-row items-center mb-2">
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="wallet-outline" size={24} color="white" />
            </View>
            <View className="ml-3">
              <Text className="text-white/80 text-sm">Monthly Income</Text>
              <Text className="text-white text-2xl font-bold">
                {formatAmount(monthlySalary)}
              </Text>
            </View>
          </View>
          <Text className="text-white/60 text-sm">
            Your budget is calculated based on your monthly income
          </Text>
        </View>

        {/* Budget Categories */}
        {Object.entries(BUDGET_CATEGORIES).map(([key, category]) => (
          <BudgetCard
            key={key}
            title={category.title}
            subtitle={category.subtitle}
            description={category.description}
            amount={monthlySalary * category.percentage}
            color={category.color}
            icon={category.icon}
            items={category.items}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
} 