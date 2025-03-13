import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfile() {
  const router = useRouter();
  const { current: currentUser, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      // Request permission first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        // Here you would typically upload the image to your storage
        // and update the user's profile with the new image URL
        // For now, we'll just show the selected image
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
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
          <Text className="text-xl font-semibold">Edit Profile</Text>
          <View className="w-10" />
        </View>
      </View>

      <View className="flex-1 p-4">
        {/* Profile Image */}
        <View className="items-center mb-6">
          <View className="relative">
            <Image
              source={{ 
                uri: image || 'https://via.placeholder.com/150'
              }}
              className="w-32 h-32 rounded-full"
            />
            <TouchableOpacity 
              onPress={pickImage}
              className="absolute bottom-0 right-0 bg-[#351e1a] w-10 h-10 rounded-full items-center justify-center"
            >
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <Ionicons name="person" size={24} color="#666" className="mr-3" />
            <View>
              <Text className="text-gray-500 text-sm">Name</Text>
              <Text className="text-gray-800 font-medium">{currentUser?.name}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="mail" size={24} color="#666" className="mr-3" />
            <View>
              <Text className="text-gray-500 text-sm">Email</Text>
              <Text className="text-gray-800 font-medium">{currentUser?.email}</Text>
            </View>
          </View>
        </View>

        <Text className="text-gray-500 text-center mt-4">
          Only profile picture can be updated at this time
        </Text>
      </View>
    </SafeAreaView>
  );
} 