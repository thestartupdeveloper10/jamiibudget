import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ExpenseDB, IncomeDB } from '../../lib/appwriteDb';
import { useUser } from '../../contexts/UserContext';
import { useTransactionStore } from '../../contexts/TransactionContext';
import { useRouter } from 'expo-router';

// Move the categories and QuickAmounts outside the component to prevent re-creation
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

const QuickAmounts = [
  { amount: 100, label: '100' },
  { amount: 500, label: '500' },
  { amount: 1000, label: '1K' },
  { amount: 2000, label: '2K' },
  { amount: 5000, label: '5K' },
  { amount: 10000, label: '10K' },
];

export default function Add() {
  const router = useRouter();
  // Custom hook for navigation to avoid using router directly
  const useCustomNavigation = () => {
    const navigateHome = useCallback(() => {
      router.navigate('/home')
    }, []);

    return { navigateHome };
  };

  const { navigateHome } = useCustomNavigation();
  const { current: user } = useUser();
  
  // Transaction type state (use string for simplicity)
  const [transactionType, setTransactionType] = useState('expense');
  
  // Form values
  const [formValues, setFormValues] = useState({
    amount: '',
    categoryId: '',
    description: '',
    date: new Date(),
  });
  
  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setShouldRefresh } = useTransactionStore();

  // Derived values
  const currentCategories = categories[transactionType] || categories.expense;
  const selectedCategory = currentCategories.find(cat => cat.id === formValues.categoryId);

  // Memoized handlers to prevent recreation on each render
  const handleFormChange = useCallback((field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleTypeChange = useCallback((newType) => {
    setTransactionType(newType);
    // Reset category when changing types as they have different category sets
    setFormValues(prev => ({
      ...prev,
      categoryId: ''
    }));
  }, []);

  const resetForm = useCallback(() => {
    setTransactionType('expense');
    setFormValues({
      amount: '',
      categoryId: '',
      description: '',
      date: new Date(),
    });
  }, []);

  const getCurrentDate = useCallback(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return now;
  }, []);

  const handleSave = useCallback(async () => {
    // Form validation
    if (!formValues.amount || !formValues.categoryId || !formValues.description) {
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
        amount: parseFloat(formValues.amount),
        category: selectedCategory?.name.toLowerCase() || '',
        description: formValues.description,
        date: formValues.date.toISOString(),
      };

      // Save to appropriate database
      if (transactionType === 'expense') {
        await ExpenseDB.create(data);
      } else {
        await IncomeDB.create(data);
      }

      setShouldRefresh(true);
      resetForm();
      
      // Navigate home
      navigateHome();
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formValues, transactionType, user, selectedCategory, navigateHome, resetForm, setShouldRefresh]);

  // Render category items - memoized to prevent unnecessary re-renders
  const renderCategoryItems = useCallback(() => {
    return currentCategories.map(cat => (
      <TouchableOpacity
        key={cat.id}
        className={`py-3 px-4 rounded-xl flex-row items-center
          ${formValues.categoryId === cat.id ? 'bg-[#006D77]/10' : 'bg-gray-50'}`}
        onPress={() => handleFormChange('categoryId', cat.id)}
      >
        <View 
          className={`w-8 h-8 rounded-full items-center justify-center mr-2
            ${formValues.categoryId === cat.id ? 'bg-[#006D77]' : 'bg-gray-200'}`}
        >
          <Ionicons 
            name={cat.icon} 
            size={16} 
            color={formValues.categoryId === cat.id ? 'white' : '#666'} 
          />
        </View>
        <Text className={`font-medium
          ${formValues.categoryId === cat.id ? 'text-[#006D77]' : 'text-gray-700'}`}>
          {cat.name}
        </Text>
      </TouchableOpacity>
    ));
  }, [currentCategories, formValues.categoryId, handleFormChange]);

  // Split UI into small, focused components
  const Header = () => (
    <View className="px-4 py-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <TouchableOpacity onPress={navigateHome}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl pl-36 font-semibold">
          {transactionType === 'expense' ? 'Add Expense' : 'Add Income'}
        </Text>
      </View>
    </View>
  );

  const TypeSelector = () => (
    <View className="p-4">
      <View className="flex-row bg-gray-100 rounded-xl p-1">
        <TouchableOpacity 
          className={`flex-1 py-3 rounded-lg ${transactionType === 'expense' ? 'bg-white shadow' : ''}`}
          onPress={() => handleTypeChange('expense')}
        >
          <Text className={`text-center font-medium ${transactionType === 'expense' ? 'text-[#006D77]' : 'text-gray-600'}`}>
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 rounded-lg ${transactionType === 'income' ? 'bg-white shadow' : ''}`}
          onPress={() => handleTypeChange('income')}
        >
          <Text className={`text-center font-medium ${transactionType === 'income' ? 'text-[#006D77]' : 'text-gray-600'}`}>
            Income
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const AmountInput = () => (
    <View className="px-4 mb-6">
      <Text className="text-gray-500 mb-2">Amount</Text>
      <View className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3">
        <Text className="text-gray-600 text-lg mr-2">KES</Text>
        <TextInput
          className="flex-1 text-2xl font-semibold text-gray-900"
          placeholder="0.00"
          keyboardType="numeric"
          value={formValues.amount}
          onChangeText={value => handleFormChange('amount', value)}
        />
      </View>

      {/* Quick Amount Grid */}
      <View className="flex-row flex-wrap justify-between">
        {QuickAmounts.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`w-[31%] py-3 mb-3 rounded-xl justify-center items-center border
              ${formValues.amount === item.amount?.toString() ? 'border-[#006D77] bg-[#006D77]/5' : 'border-gray-200'}`}
            onPress={() => item.amount && handleFormChange('amount', item.amount.toString())}
          >
            <Text className={`font-medium ${formValues.amount === item.amount?.toString() ? 'text-[#006D77]' : 'text-gray-700'}`}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const CategorySelector = () => (
    <View className="px-4 mb-6">
      <Text className="text-gray-500 mb-2">Category</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row gap-3">
          {renderCategoryItems()}
        </View>
      </ScrollView>
    </View>
  );

  const DateSelector = () => (
    <TouchableOpacity 
      className="px-4 py-4 mb-6 flex-row items-center justify-between bg-gray-50 mx-4 rounded-xl"
      onPress={() => setShowDatePicker(true)}
    >
      <View className="flex-row items-center">
        <Ionicons name="calendar-outline" size={24} color="#666" className="mr-3" />
        <Text className="text-gray-700">
          {formValues.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const DescriptionInput = () => (
    <View className="px-4 mb-6">
    <Text className="text-gray-500 mb-2">Description</Text>
    <TextInput
      className="bg-gray-50 p-4 rounded-xl text-gray-700"
      placeholder="What's this transaction for?"
      multiline
      value={formValues.description}
      onChangeText={value => handleFormChange('description', value)}
    />
  </View>
  );

  const SaveButton = () => (
    <View className="p-4 border-t border-gray-100">
      <TouchableOpacity
        className={`w-full py-4 rounded-full items-center
          ${isSubmitting ? 'bg-gray-300' : 'bg-[#006D77]'}`}
        onPress={handleSave}
        disabled={isSubmitting || !formValues.amount || !formValues.categoryId}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">
            Save Transaction
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Render the separated component sections */}
      <Header />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <TypeSelector />
          <AmountInput />
          <CategorySelector />
          <DateSelector />
          <DescriptionInput />
        </ScrollView>

        <SaveButton />
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={formValues.date}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(0, 0, 0, 0);

              if (selectedDate < tomorrow) {
                handleFormChange('date', selectedDate);
              } else {
                Alert.alert('Invalid Date', 'Cannot select future dates');
              }
            }
          }}
          maximumDate={getCurrentDate()}
        />
      )}
    </SafeAreaView>
  );
}