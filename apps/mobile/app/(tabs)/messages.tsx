import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../hooks/useAuth';

export default function MessagesScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const getOtherUser = (conversation: any, currentUserId: string) => {
    if (conversation.senderId === currentUserId) {
      return conversation.receiver;
    }
    return conversation.sender;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-background-default items-center justify-center p-6">
        <Text className="text-6xl mb-4">🔒</Text>
        <Text className="text-xl font-semibold mb-2">Please Log In</Text>
        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          className="bg-primary-500 px-6 py-3 rounded-full mt-4"
        >
          <Text className="text-white font-semibold">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-background-default items-center justify-center">
        <ActivityIndicator size="large" color="#F4B400" />
        <Text className="text-gray-600 mt-4">Loading messages...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background-default"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F4B400" />
      }
    >
      <View className="p-4">
        <Text className="text-2xl font-semibold mb-4">Messages 💬</Text>

        {conversations.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center mt-4">
            <Text className="text-6xl mb-4">💬</Text>
            <Text className="text-xl font-semibold mb-2 text-center">No Messages Yet</Text>
            <Text className="text-gray-600 text-center">
              Messages will appear here after you win or give away an item
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation, user?.id || '');
              const giveaway = conversation.giveaway;
              const previewImage = giveaway?.images?.[0];
              const isUnread = conversation.status === 'SENT' && conversation.receiverId === user?.id;

              return (
                <TouchableOpacity
                  key={conversation.id}
                  onPress={() => {
                    router.push(`/messages/${conversation.giveawayId}`);
                  }}
                  className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center"
                >
                  {previewImage ? (
                    <Image
                      source={{ uri: previewImage }}
                      className="w-16 h-16 rounded-xl mr-4"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-16 h-16 bg-gray-100 rounded-xl mr-4 items-center justify-center">
                      <Text className="text-2xl">🎁</Text>
                    </View>
                  )}

                  <View className="flex-1">
                    <Text className="font-semibold text-lg mb-1" numberOfLines={1}>
                      {otherUser?.name || 'Unknown User'}
                    </Text>
                    <Text className="text-gray-600 text-sm mb-1" numberOfLines={1}>
                      {giveaway?.title || 'Giveaway'}
                    </Text>
                    <Text className="text-gray-500 text-xs" numberOfLines={1}>
                      {conversation.content}
                    </Text>
                  </View>

                  <View className="items-end ml-2">
                    <Text className="text-gray-400 text-xs mb-2">
                      {formatTime(conversation.createdAt)}
                    </Text>
                    {isUnread && (
                      <View className="w-2 h-2 bg-primary-500 rounded-full" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

