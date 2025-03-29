import { Stack } from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "../contexts/UserContext";
import { useEffect } from "react";
import { enableScreens } from 'react-native-screens';

// Enable screens for better performance
enableScreens();

export default function RootLayout() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(transactions)" />
          <Stack.Screen name="(budget)" />
        </Stack>
      </SafeAreaProvider>
    </UserProvider>
  );
}