import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { useUser } from '../../contexts/UserContext';

type FormData = {
  email: string;
  password: string;
};

export default function SignIn() {
  const user = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      setIsLoading(true);
      await user.login(data.email, data.password);
      router.replace('/(tabs)/home');
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6 h-full justify-center" style={{ minHeight: 700 }}>
        {/* Header */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-800">Welcome Back</Text>
          <Text className="text-gray-500 mt-2">
            Sign in to continue managing your finances
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="mb-4 p-4 bg-red-100 rounded-xl">
            <Text className="text-red-600">{error}</Text>
          </View>
        )}

        {/* Form */}
        <View className="space-y-4">
          {/* Email Input */}
          <View>
            <Text className="text-gray-700 mb-2 font-medium">Email Address</Text>
            <Controller
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className={`p-4 border rounded-xl bg-gray-50 ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <Text className="text-red-500 mt-1">{errors.email.message}</Text>
            )}
          </View>

          {/* Password Input */}
          <View>
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <View className="relative">
              <Controller
                control={control}
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                }}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className={`p-4 border rounded-xl bg-gray-50 ${
                      errors.password ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-red-500 mt-1">{errors.password.message}</Text>
            )}
          </View>

          {/* Forgot Password Link */}
          <View className="items-end">
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text className="text-blue-500">Forgot Password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className={`p-4 rounded-xl mt-6 ${isLoading ? 'bg-blue-400' : 'bg-blue-500'}`}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Link href="/(auth)/signUp" asChild>
              <TouchableOpacity>
                <Text className="text-blue-500 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}