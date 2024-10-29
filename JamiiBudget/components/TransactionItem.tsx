import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TransactionItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  title: string;
  amount: number;
  date: string;
  onPress?: () => void;
};

export default function TransactionItem({
  icon,
  iconBgColor,
  iconColor,
  title,
  amount,
  date,
  onPress
}: TransactionItemProps) {
  const formatAmount = (value: number) => {
    return `KES ${Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-2xl shadow-sm border border-gray-100">
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-full justify-center items-center"
            style={{ backgroundColor: iconBgColor }}
          >
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <Text className="text-gray-800 font-medium capitalize">{title}</Text>
        </View>
        <View className="items-end">
          <Text 
            className={`text-right font-medium ${
              amount < 0 ? 'text-red-500' : 'text-green-500'
            }`}
          >
            {amount < 0 ? '-' : '+'}{formatAmount(Math.abs(amount))}
          </Text>
          <Text className="text-gray-400 text-sm">{date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}