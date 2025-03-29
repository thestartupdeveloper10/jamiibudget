import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../contexts/UserContext';

export default function ChangePassword() {
  const router = useRouter();
  const { updatePassword } = useUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (password: string) => {
    // Add password validation rules
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return null;
  };

  const handleChangePassword = async () => {
    try {
      setError('');
      
      // Validate inputs
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('All fields are required');
        return;
      }

      // Validate new password
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      // Check if new password is different from current
      if (currentPassword === newPassword) {
        setError('New password must be different from current password');
        return;
      }

      setLoading(true);
      await updatePassword(currentPassword, newPassword);
      
      // Show success message and go back
      Alert.alert(
        'Success',
        'Password changed successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      setError(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

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
          <Text className="text-xl font-semibold text-gray-900">Change Password</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Current Password */}
          <View className="p-4 border-b border-gray-100">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-[#006D77]/10 items-center justify-center mr-3">
                <Ionicons name="lock-closed-outline" size={20} color="#006D77" />
              </View>
              <Text className="text-gray-700 font-medium">Current Password</Text>
            </View>
            <TextInput
              secureTextEntry
              className="bg-gray-50 mt-2 p-4 rounded-xl text-gray-900"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter your current password"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>

          {/* New Password */}
          <View className="p-4 border-b border-gray-100">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-[#2A9D8F]/10 items-center justify-center mr-3">
                <Ionicons name="key-outline" size={20} color="#2A9D8F" />
              </View>
              <Text className="text-gray-700 font-medium">New Password</Text>
            </View>
            <TextInput
              secureTextEntry
              className="bg-gray-50 mt-2 p-4 rounded-xl text-gray-900"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter your new password"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>

          {/* Confirm Password */}
          <View className="p-4">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-[#E9C46A]/10 items-center justify-center mr-3">
                <Ionicons name="checkmark-outline" size={20} color="#E9C46A" />
              </View>
              <Text className="text-gray-700 font-medium">Confirm Password</Text>
            </View>
            <TextInput
              secureTextEntry
              className="bg-gray-50 mt-2 p-4 rounded-xl text-gray-900"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your new password"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Requirements */}
        <View className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Ionicons name="information-circle-outline" size={20} color="#006D77" />
            <Text className="text-gray-700 font-medium ml-2">Password Requirements</Text>
          </View>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-gray-300 mr-2" />
              <Text className="text-gray-600">At least 8 characters long</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-gray-300 mr-2" />
              <Text className="text-gray-600">Must be different from current password</Text>
            </View>
          </View>
        </View>

        {/* Error Message */}
        {error ? (
          <View className="mt-4 bg-red-50 p-4 rounded-xl">
            <View className="flex-row items-center">
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              <Text className="text-red-600 ml-2">{error}</Text>
            </View>
          </View>
        ) : null}

        {/* Submit Button */}
        <View className="mt-6">
          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={loading}
            className={`bg-[#006D77] py-4 rounded-xl flex-row items-center justify-center
              ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? (
              <>
                <Ionicons name="reload-outline" size={20} color="white" className="animate-spin" />
                <Text className="text-white font-medium ml-2">Changing Password...</Text>
              </>
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="white" />
                <Text className="text-white font-medium ml-2">Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 