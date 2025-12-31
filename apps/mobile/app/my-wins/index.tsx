import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function MyWinsScreen() {
  const [wins, setWins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWins();
  }, []);

  const fetchWins = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getMyWins();
      const list = (res && (res.wins || res)) || [];
      setWins(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to load wins', error);
      setWins([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background-default items-center justify-center">
        <ActivityIndicator size="large" color="#F4B400" />
        <Text className="text-gray-600 mt-4">Loading your wins...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background-default p-4">
      <Text className="text-2xl font-semibold mb-4">My Wins</Text>
      {wins.length === 0 ? (
        <View className="bg-white p-6 rounded-2xl items-center">
          <Text className="text-gray-600">You have no wins yet.</Text>
        </View>
      ) : (
        <View className="gap-3">
          {wins.map((w) => (
            <View key={w.id} className="bg-white p-4 rounded-2xl">
              <Text className="font-semibold">{w.title || w.giveawayTitle}</Text>
              <Text className="text-gray-600 text-sm">Received: {w.receivedAt || w.createdAt}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
