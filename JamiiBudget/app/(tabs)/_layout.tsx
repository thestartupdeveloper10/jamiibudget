import { Tabs } from "expo-router"
import { Ionicons } from '@expo/vector-icons';
import { View } from "react-native"

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          elevation: 0,
          borderTopWidth: 1,
          borderTopColor: '#f1f1f1',
        },
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ color, size }) => (
            <View className="bg-blue-500 rounded-full p-2 -mt-6">
              <Ionicons name="add" size={size} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}