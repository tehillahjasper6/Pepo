import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    }
  };

  return (
    <ScrollView className="flex-1 bg-background-default">
      <View className="flex-1 justify-center p-6">
        {/* Logo */}
        <View className="items-center mb-8">
          <Text className="text-6xl mb-4">🐝</Text>
          <Text className="text-4xl font-bold text-primary-600 mb-2">PEPO</Text>
          <Text className="text-gray-600">Welcome Back</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="font-medium mb-2 text-gray-700">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white px-4 py-3 rounded-xl border border-gray-200"
            />
          </View>

          <View>
            <Text className="font-medium mb-2 text-gray-700">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              className="bg-white px-4 py-3 rounded-xl border border-gray-200"
            />
          </View>

          {error && (
            <View className="bg-red-50 p-3 rounded-lg">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-primary-500 rounded-2xl py-4 mt-4"
          >
            <Text className="text-white font-semibold text-center text-lg">
              {isLoading ? 'Logging in...' : 'Log In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/signup')}
            className="mt-4"
          >
            <Text className="text-center text-gray-600">
              Don't have an account? <Text className="text-primary-600 font-semibold">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}



