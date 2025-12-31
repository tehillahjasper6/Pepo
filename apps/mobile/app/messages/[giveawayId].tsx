import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';

export default function MessageDetailScreen() {
  const router = useRouter();
  const { giveawayId } = useLocalSearchParams<{ giveawayId: string }>();
  const { user, isAuthenticated } = useAuth();
  const { messages, isConnected, sendMessage, joinGiveaway, leaveGiveaway } = useSocket(giveawayId);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    if (giveawayId) {
      joinGiveaway(giveawayId);
      setLoading(false);
    }

    return () => {
      if (giveawayId) leaveGiveaway(giveawayId);
    };
  }, [giveawayId, joinGiveaway, leaveGiveaway]);

  const handleSend = async () => {
    if (!content.trim()) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      setSending(true);
      await sendMessage(content.trim());
      setContent('');
      setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background-default items-center justify-center">
        <ActivityIndicator size="large" color="#F4B400" />
        <Text className="text-gray-600 mt-4">Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView ref={scrollRef} className="flex-1 bg-background-default p-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-semibold">Conversation</Text>
          <View className="flex-row items-center gap-2">
            <View className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <Text className="text-xs text-gray-600">{isConnected ? 'Connected' : 'Offline'}</Text>
          </View>
        </View>

        {messages.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center">
            <Text className="text-gray-600">No messages yet. Say hello!</Text>
          </View>
        ) : (
          <View className="gap-3">
            {messages.map((m) => (
              <View key={m.id} className={`p-3 rounded-2xl ${m.sender?.id === user?.id ? 'bg-primary-500 self-end' : 'bg-white self-start'}`}>
                <Text className={`${m.sender?.id === user?.id ? 'text-white' : 'text-gray-800'} font-medium`}>{m.sender?.name || 'User'}</Text>
                <Text className={`${m.sender?.id === user?.id ? 'text-white' : 'text-gray-700'} mt-1`}>{m.content}</Text>
                <Text className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      <View className="p-3 border-t border-gray-100 bg-white">
        <View className="flex-row items-center">
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write a message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-3"
          />
          <TouchableOpacity onPress={handleSend} disabled={sending} className="bg-primary-500 px-4 py-3 rounded-full">
            <Text className="text-white font-semibold">{sending ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
