import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { useUser } from '../../contexts/UserContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

type FormData = {
  email: string;
  password: string;
};

const { height } = Dimensions.get('window');

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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ minHeight: height }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Branding Section */}
          <View className="pt-10 pb-8 px-6">
            <View className="items-center">
              <Image 
                source={require('../../assets/images/logo.png')} 
                className="w-20 h-20"
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-gray-900 mt-4">
                Jamii Budget
              </Text>
              <Text className="text-sm text-gray-500 text-center mt-1">
                Smart Savings, Brighter Futures
              </Text>
            </View>
          </View>

          {/* Main Content */}
          <View className="flex-1 px-6">
            {/* Welcome Text */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900">
                Welcome Back
              </Text>
              <Text className="text-base text-gray-500 mt-2">
                Sign in to continue managing your finances
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            )}

            {/* Form Section */}
            <View className="space-y-5">
              {/* Email Input */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </Text>
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
                    <View className="relative">
                      <View className="absolute left-4 top-3.5">
                        <Ionicons name="mail-outline" size={20} color="#6B7280" />
                      </View>
                      <TextInput
                        className={`pl-6 pr-4 py-3.5 bg-gray-50 rounded-xl text-base ${
                          errors.email ? 'border-2 border-red-300' : 'border border-gray-200'
                        }`}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={onChange}
                        value={value}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  )}
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm mt-1.5">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </Text>
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
                    <View className="relative">
                      <View className="absolute left-4 top-3.5">
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                      </View>
                      <TextInput
                        className={`pl-6 pr-6 py-3.5 bg-gray-50 rounded-xl text-base ${
                          errors.password ? 'border-2 border-red-300' : 'border border-gray-200'
                        }`}
                        placeholder="Enter your password"
                        secureTextEntry={!showPassword}
                        onChangeText={onChange}
                        value={value}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        className="absolute right-4 top-3.5"
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.password && (
                  <Text className="text-red-500 text-sm mt-1.5">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Forgot Password Link */}
              <View className="items-end">
                <Link href="/(auth)/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-600 font-medium">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                className={`py-4 rounded-xl mt-4 ${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600'
                }`}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-base">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Section */}
          <View className="p-6">
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600">Don't have an account? </Text>
              <Link href="/(auth)/signUp" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}