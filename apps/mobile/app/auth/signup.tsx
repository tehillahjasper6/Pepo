import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function SignupScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    gender: 'PREFER_NOT_TO_SAY',
  });

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      await register(formData);
      Alert.alert('Success', 'Account created! Welcome to PEPO! 🐝');
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    }
  };

  return (
    <ScrollView className="flex-1 bg-background-default">
      <View className="flex-1 justify-center p-6">
        {/* Logo */}
        <View className="items-center mb-8">
          <Text className="text-6xl mb-4">🐝</Text>
          <Text className="text-4xl font-bold text-primary-600 mb-2">Join PEPO</Text>
          <Text className="text-gray-600">Start giving and receiving</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="font-medium mb-2 text-gray-700">Full Name</Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="John Doe"
              className="bg-white px-4 py-3 rounded-xl border border-gray-200"
            />
          </View>

          <View>
            <Text className="font-medium mb-2 text-gray-700">Email</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white px-4 py-3 rounded-xl border border-gray-200"
            />
          </View>

          <View>
            <Text className="font-medium mb-2 text-gray-700">Password</Text>
            <TextInput
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="••••••••"
              secureTextEntry
              className="bg-white px-4 py-3 rounded-xl border border-gray-200"
            />
            <Text className="text-xs text-gray-500 mt-1">At least 8 characters</Text>
          </View>

          <View>
            <Text className="font-medium mb-2 text-gray-700">City</Text>
            <TextInput
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
              placeholder="e.g., New York"
              className="bg-white px-4 py-3 rounded-xl border border-gray-200"
            />
          </View>

          {error && (
            <View className="bg-red-50 p-3 rounded-lg">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSignup}
            disabled={isLoading}
            className="bg-primary-500 rounded-2xl py-4 mt-4"
          >
            <Text className="text-white font-semibold text-center text-lg">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4"
          >
            <Text className="text-center text-gray-600">
              Already have an account? <Text className="text-primary-600 font-semibold">Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}



