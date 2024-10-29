import React from 'react';
import { View, Text, ScrollView, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../contexts/UserContext';

const menuItems = [
  {
    title: 'Account',
    items: [
      { id: '1', name: 'Edit Profile', icon: 'person-outline', color: '#2196F3' },
      { id: '2', name: 'Change Password', icon: 'lock-closed-outline', color: '#4CAF50' },
    ]
  },
  {
    title: 'Other',
    items: [
      { id: '3', name: 'Log Out', icon: 'log-out-outline', color: '#F44336' },
    ]
  }
];

export default function Profile() {
  const user = useUser();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const currentUser = user.current;
  const handleMenuItemPress = async (itemId: string) => {
    switch (itemId) {
      case '3': // Logout
        await  user.logout();
        router.push('/(auth)/signIn');
        break;
      default:
        console.log(`Pressed item ${itemId}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-4 py-6 bg-white">
        <Text className="text-2xl font-bold text-gray-800">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Card */}
        <View className="bg-white p-4 mb-6">
          <View className="flex-row items-center">
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              className="w-20 h-20 rounded-full"
            />
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-800">{currentUser?.name}</Text>
              <Text className="text-gray-500">{currentUser?.email}</Text>
              <View 
                className="bg-[#351e1a] self-start px-4 py-2 rounded-full mt-2"
                onTouchEnd={() => console.log('Edit profile')}
              >
                <Text className="text-white font-medium">Edit Profile</Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-between mt-6 pt-6 border-t border-gray-100">
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#8e5347]">KES 25,400</Text>
              <Text className="text-gray-500">Total Balance</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#8e5347]">42</Text>
              <Text className="text-gray-500">Transactions</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#8e5347]">8</Text>
              <Text className="text-gray-500">Categories</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section) => (
          <View key={section.title} className="px-4 mb-6">
            <Text className="text-gray-500 mb-2 ml-1">{section.title}</Text>
            {section.items.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center justify-between p-4 bg-white rounded-xl mb-2"
                onTouchEnd={() => handleMenuItemPress(item.id)}
              >
                <View className="flex-row items-center">
                  <View 
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text className="text-gray-800 font-medium">{item.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="gray" />
              </View>
            ))}
          </View>
        ))}

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-400">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}