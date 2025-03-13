import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
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
      <View className="bg-white">
        <View className="flex-row justify-between items-center px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Change Password</Text>
          <View className="w-10" />
        </View>
      </View>

      <View className="flex-1 p-4">
        <View className="bg-white rounded-xl p-4 space-y-4">
          <View>
            <Text className="text-gray-500 mb-2">Current Password</Text>
            <TextInput
              secureTextEntry
              className="bg-gray-100 p-3 rounded-lg"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-gray-500 mb-2">New Password</Text>
            <TextInput
              secureTextEntry
              className="bg-gray-100 p-3 rounded-lg"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-gray-500 mb-2">Confirm New Password</Text>
            <TextInput
              secureTextEntry
              className="bg-gray-100 p-3 rounded-lg"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              autoCapitalize="none"
            />
          </View>

          {error ? (
            <Text className="text-red-500 text-center">{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={loading}
            className={`bg-[#351e1a] py-3 mt-3 rounded-lg ${loading ? 'opacity-50' : ''}`}
          >
            <Text className="text-white text-center font-medium">
              {loading ? 'Changing Password...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-500 text-sm text-center mt-4">
          Password must be at least 8 characters long
        </Text>
      </View>
    </SafeAreaView>
  );
} 