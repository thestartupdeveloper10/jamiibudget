import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const categories = {
  expense: [
    { id: '1', name: 'Food', icon: 'fast-food', color: '#FF9800' },
    { id: '2', name: 'Shopping', icon: 'cart', color: '#2196F3' },
    { id: '3', name: 'Transport', icon: 'car', color: '#4CAF50' },
    { id: '4', name: 'Bills', icon: 'receipt', color: '#F44336' },
    { id: '5', name: 'Entertainment', icon: 'game-controller', color: '#9C27B0' },
  ],
  income: [
    { id: '6', name: 'Salary', icon: 'wallet', color: '#009688' },
    { id: '7', name: 'Freelance', icon: 'laptop', color: '#3F51B5' },
    { id: '8', name: 'Investment', icon: 'trending-up', color: '#607D8B' },
  ]
};

export default function Add() {
  const router = useRouter();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const currentCategories = categories[type];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-100">
        <Pressable onPress={() => router.push('/(tabs)')}>
          <Ionicons name="close" size={24} color="black" />
        </Pressable>
        <Text className="text-xl font-semibold">Add Transaction</Text>
        <Pressable onPress={() => router.push('/(tabs)')}>
          <Text className="text-blue-500 font-semibold">Save</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Transaction Type Toggle */}
        <View className="flex-row bg-gray-100 p-1 rounded-xl mb-6">
          <Pressable 
            className={`flex-1 p-3 rounded-xl ${type === 'expense' ? 'bg-white shadow' : ''}`}
            onPress={() => setType('expense')}
          >
            <Text className={`text-center font-medium ${type === 'expense' ? 'text-blue-500' : 'text-gray-500'}`}>
              Expense
            </Text>
          </Pressable>
          <Pressable 
            className={`flex-1 p-3 rounded-xl ${type === 'income' ? 'bg-white shadow' : ''}`}
            onPress={() => setType('income')}
          >
            <Text className={`text-center font-medium ${type === 'income' ? 'text-blue-500' : 'text-gray-500'}`}>
              Income
            </Text>
          </Pressable>
        </View>

        {/* Amount Input */}
        <View className="mb-6">
          <Text className="text-gray-600 mb-2">Amount</Text>
          <TextInput
            className="text-3xl font-semibold p-4 bg-gray-50 rounded-xl"
            keyboardType="decimal-pad"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Category Selection */}
        <View className="mb-6">
          <Text className="text-gray-600 mb-2">Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {currentCategories.map((category) => (
              <Pressable
                key={category.id}
                className={`p-3 rounded-xl flex-row items-center ${
                  selectedCategory === category.id ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: category.color }}
                >
                  <Ionicons name={category.icon as any} size={16} color="white" />
                </View>
                <Text
                  className={
                    selectedCategory === category.id ? 'text-blue-500' : 'text-gray-700'
                  }
                >
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Date Selection */}
        <Pressable
          className="mb-6 flex-row items-center bg-gray-50 p-4 rounded-xl"
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={24} color="gray" />
          <Text className="text-gray-600 ml-2">
            {date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        {/* Description Input */}
        <View className="mb-6">
          <Text className="text-gray-600 mb-2">Description</Text>
          <TextInput
            className="p-4 bg-gray-50 rounded-xl"
            placeholder="Add a description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}