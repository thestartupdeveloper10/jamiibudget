import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ExpenseDB, IncomeDB } from '../../lib/appwriteDb';
import { useUser } from '../../contexts/UserContext';

const categories = {
  expense: [
    { id: '1', name: 'Food', icon: 'fast-food', color: '#FF9800' },
    { id: '2', name: 'Shopping', icon: 'cart', color: '#2196F3' },
    { id: '3', name: 'Transport', icon: 'car', color: '#4CAF50' },
    { id: '4', name: 'Bills', icon: 'receipt', color: '#F44336' },
    { id: '5', name: 'Entertainment', icon: 'game-controller', color: '#9C27B0' },
    { id: '6', name: 'Education', icon: 'book', color: '#9B0' },
    { id: '7', name: 'Other', icon: 'ellipsis-horizontal', color: '#607D8B' },
  ],
  income: [
    { id: '8', name: 'Salary', icon: 'wallet', color: '#009688' },
    { id: '9', name: 'Freelance', icon: 'laptop', color: '#3F51B5' },
    { id: '10', name: 'Investment', icon: 'trending-up', color: '#607D8B' },
    { id: '11', name: 'Business', icon: 'business', color: '#795548' },
    { id: '12', name: 'Other', icon: 'ellipsis-horizontal', color: '#9E9E9E' },
  ]
};

export default function Add() {
  const router = useRouter();
  const { current: user } = useUser();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategories = categories[type];

  const selectedCategoryDetails = currentCategories.find(cat => cat.id === selectedCategory);

  console.log(user?.$id)
  const getData = async () => {
  console.log(await ExpenseDB.listByUser(user?.$id))}

  getData();

  const handleSave = async () => {
    if (!amount || !selectedCategory || !description) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to add transactions');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        userId: user.$id,
        amount: parseFloat(amount),
        category: selectedCategoryDetails?.name.toLowerCase() || '',
        description,
        date: date.toISOString(),
      };

      if (type === 'expense') {
        await ExpenseDB.create(data);
      } else {
        await IncomeDB.create(data);
      }

      router.push('/(tabs)');
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidForm = amount && selectedCategory && description;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white">
        <View className="flex-row justify-between items-center px-4 py-4">
          <Pressable 
            onPress={() => router.push('/(tabs)')}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </Pressable>
          <Text className="text-xl font-semibold">New {type}</Text>
          <Pressable 
            onPress={handleSave}
            disabled={!isValidForm || isSubmitting}
            className={`px-4 py-2 rounded-full ${isValidForm ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <Text className="text-white font-medium">
              {isSubmitting ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        {/* Amount Input */}
        <View className="px-4 py-6 border-t border-gray-100">
          <View className="flex-row items-center justify-center">
            <Text className="text-3xl font-bold mr-2">KES</Text>
            <TextInput
              className="text-4xl font-bold text-center w-48"
              keyboardType="decimal-pad"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* Transaction Type Pills */}
        <View className="flex-row px-4 pb-4">
          <Pressable 
            className={`flex-1 p-3 rounded-xl mr-2 ${
              type === 'expense' ? 'bg-red-100' : 'bg-gray-100'
            }`}
            onPress={() => setType('expense')}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons 
                name="arrow-down-circle" 
                size={20} 
                color={type === 'expense' ? '#EF4444' : '#6B7280'} 
              />
              <Text className={`ml-2 font-medium ${
                type === 'expense' ? 'text-red-500' : 'text-gray-500'
              }`}>
                Expense
              </Text>
            </View>
          </Pressable>
          <Pressable 
            className={`flex-1 p-3 rounded-xl ${
              type === 'income' ? 'bg-green-100' : 'bg-gray-100'
            }`}
            onPress={() => setType('income')}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons 
                name="arrow-up-circle" 
                size={20} 
                color={type === 'income' ? '#10B981' : '#6B7280'} 
              />
              <Text className={`ml-2 font-medium ${
                type === 'income' ? 'text-green-500' : 'text-gray-500'
              }`}>
                Income
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Category Grid */}
        <Text className="text-lg font-semibold mb-3">Category</Text>
        <View className="flex-row flex-wrap gap-3">
          {currentCategories.map((category) => (
            <Pressable
              key={category.id}
              className={`w-[100px] aspect-square rounded-2xl p-4 ${
                selectedCategory === category.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white'
              }`}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View className="flex-1 items-center justify-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Ionicons 
                    name={category.icon as any} 
                    size={24} 
                    color={category.color} 
                  />
                </View>
                <Text className="text-center text-gray-700">{category.name}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Date & Description */}
        <View className="mt-6 space-y-4">
          <Pressable
            className="flex-row items-center bg-white p-4 rounded-xl"
            onPress={() => setShowDatePicker(true)}
          >
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
              <Ionicons name="calendar" size={20} color="#2563EB" />
            </View>
            <View className="ml-3">
              <Text className="text-sm text-gray-500">Date</Text>
              <Text className="text-gray-700 font-medium">
                {date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </Pressable>

          <View className="bg-white p-4 rounded-xl">
            <Text className="text-sm text-gray-500 mb-2">Description</Text>
            <TextInput
              className="text-gray-700"
              placeholder="What's this transaction for?"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>
      </ScrollView>

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
    </SafeAreaView>
  );
}