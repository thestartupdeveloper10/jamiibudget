import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';


// Define the form data type
type FormData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export default function SignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      // Add your registration logic here
      console.log(data);
      // On successful registration
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1  bg-white">
      <View className="p-6 h-full justify-center">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800">Create Account</Text>
          <Text className="text-gray-500 mt-2">
            Track your expenses and save money with JamiiBudget
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          {/* Full Name Input */}
          <View>
            <Text className="text-gray-700 mb-2">Full Name</Text>
            <Controller
              control={control}
              rules={{
                required: 'Full name is required',
              }}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className={`p-4 border rounded-xl bg-gray-50 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter your full name"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.fullName && (
              <Text className="text-red-500 mt-1">{errors.fullName.message}</Text>
            )}
          </View>

          {/* Email Input */}
          <View>
            <Text className="text-gray-700 mb-2">Email Address</Text>
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

          {/* Phone Input */}
          <View>
            <Text className="text-gray-700 mb-2">Phone Number</Text>
            <Controller
              control={control}
              rules={{
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Please enter a valid phone number'
                }
              }}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className={`p-4 border rounded-xl bg-gray-50 ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.phone && (
              <Text className="text-red-500 mt-1">{errors.phone.message}</Text>
            )}
          </View>

          {/* Password Input */}
          <View>
            <Text className="text-gray-700 mb-2">Password</Text>
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
                    placeholder="Create a password"
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

          {/* Confirm Password Input */}
          <View>
            <Text className="text-gray-700 mb-2">Confirm Password</Text>
            <View className="relative">
              <Controller
                control={control}
                rules={{
                  required: 'Please confirm your password',
                  validate: value =>
                    value === password || 'Passwords do not match'
                }}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className={`p-4 border rounded-xl bg-gray-50 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Confirm your password"
                    secureTextEntry={!showConfirmPassword}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text className="text-red-500 mt-1">
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-xl mt-6"
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/(auth)/signIn" className="text-blue-500 font-semibold">
              Login
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}