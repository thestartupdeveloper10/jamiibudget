import { Stack } from 'expo-router';

export default function TransactionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="all"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="[id]"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}