import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';

type FormData = {
  email: string;
  password: string;
};

export default function signIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      // Add your login logic here
      console.log(data);
      // On successful login
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error(error);
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
                  required: 'Password is required'
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
            <Link href="/(auth)/forgot-password" className="text-blue-500">
              Forgot Password?
            </Link>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-xl mt-6"
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

          {/* Social Login Options */}
          <View className="mt-6">
            <View className="flex-row items-center">
              <View className="flex-1 h-0.5 bg-gray-200" />
              <Text className="mx-4 text-gray-500">Or continue with</Text>
              <View className="flex-1 h-0.5 bg-gray-200" />
            </View>

            <View className="flex-row justify-center space-x-4 mt-4">
              {/* Google Sign In */}
              <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 rounded-xl p-4 flex-1">
                <Ionicons name="logo-google" size={24} color="#DB4437" />
                <Text className="ml-2 font-medium text-gray-700">Google</Text>
              </TouchableOpacity>

              {/* Apple Sign In */}
              <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 rounded-xl p-4 flex-1">
                <Ionicons name="logo-apple" size={24} color="#000000" />
                <Text className="ml-2 font-medium text-gray-700">Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Link href="/(auth)/signUp" className="text-blue-500 font-semibold">
              Sign Up
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}