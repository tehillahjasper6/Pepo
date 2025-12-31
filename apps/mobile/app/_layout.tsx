import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#F4B400',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'PEPO' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
        <Stack.Screen name="auth/signup" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="giveaway/[id]" options={{ title: 'Giveaway Details' }} />
        <Stack.Screen name="messages/[giveawayId]" options={{ title: 'Messages' }} />
        <Stack.Screen name="my-giveaways" options={{ title: 'My Giveaways' }} />
        <Stack.Screen name="my-participations" options={{ title: 'My Participations' }} />
        <Stack.Screen name="my-wins" options={{ title: 'My Wins' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </>
  );
}

