import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary-500 items-center justify-center px-6">
      {/* Bee Mascot */}
      <View className="mb-8">
        <Text className="text-8xl">🐝</Text>
      </View>

      {/* Brand */}
      <Text className="text-5xl font-bold text-white mb-4">PEPO</Text>
      <Text className="text-xl text-white/90 text-center mb-12">
        Give Freely. Live Lightly.
      </Text>

      {/* Description */}
      <Text className="text-white/80 text-center mb-12 px-4">
        Join a community built on generosity, fairness, and dignity. Share what you don't need, 
        receive what you do.
      </Text>

      {/* CTA Buttons */}
      <View className="w-full space-y-4">
        <TouchableOpacity
          onPress={() => router.push('/auth/signup')}
          className="bg-white rounded-2xl py-4 px-8 mb-4"
        >
          <Text className="text-primary-600 font-semibold text-center text-lg">
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          className="border-2 border-white rounded-2xl py-4 px-8"
        >
          <Text className="text-white font-semibold text-center text-lg">
            Log In
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text className="text-white/60 text-sm mt-12">
        No buying, selling, or bidding. Ever.
      </Text>
    </View>
  );
}




