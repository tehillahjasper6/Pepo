import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-background-default">
      {/* Hero Section */}
      <View className="bg-primary-500 p-6 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white text-2xl font-bold">Welcome to PEPO! 🐝</Text>
            <Text className="text-white/80 mt-1">Give freely. Live lightly.</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row bg-white/20 rounded-2xl p-4">
          <View className="flex-1 items-center">
            <Text className="text-white text-2xl font-bold">0</Text>
            <Text className="text-white/80 text-xs">Given</Text>
          </View>
          <View className="flex-1 items-center border-l border-white/20">
            <Text className="text-white text-2xl font-bold">0</Text>
            <Text className="text-white/80 text-xs">Received</Text>
          </View>
          <View className="flex-1 items-center border-l border-white/20">
            <Text className="text-white text-2xl font-bold">0</Text>
            <Text className="text-white/80 text-xs">Interested</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="p-6">
        <Text className="text-2xl font-semibold mb-4">Quick Actions</Text>
        
        <View className="flex-row flex-wrap gap-4">
          <TouchableOpacity
            onPress={() => router.push('/browse')}
            className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 shadow-sm"
          >
            <Text className="text-4xl mb-2">🔍</Text>
            <Text className="font-semibold text-lg">Browse</Text>
            <Text className="text-gray-600 text-sm">Find giveaways</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/create')}
            className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 shadow-sm"
          >
            <Text className="text-4xl mb-2">🎁</Text>
            <Text className="font-semibold text-lg">Give</Text>
            <Text className="text-gray-600 text-sm">Post an item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/profile')}
            className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 shadow-sm"
          >
            <Text className="text-4xl mb-2">📊</Text>
            <Text className="font-semibold text-lg">Activity</Text>
            <Text className="text-gray-600 text-sm">Your history</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/messages')}
            className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 shadow-sm"
          >
            <Text className="text-4xl mb-2">💬</Text>
            <Text className="font-semibold text-lg">Messages</Text>
            <Text className="text-gray-600 text-sm">Chat with others</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Section */}
      <View className="p-6">
        <Text className="text-2xl font-semibold mb-4">Recent Giveaways</Text>
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-500 text-center py-8">
            No giveaways yet. Be the first to post!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}




