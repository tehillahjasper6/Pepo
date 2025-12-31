import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function MyGiveawaysScreen() {
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyGiveaways();
  }, []);

  const fetchMyGiveaways = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getMyGiveaways();
      const list = (res && (res.giveaways || res)) || [];
      setGiveaways(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to load my giveaways', error);
      setGiveaways([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background-default items-center justify-center">
        <ActivityIndicator size="large" color="#F4B400" />
        <Text className="text-gray-600 mt-4">Loading your giveaways...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background-default p-4">
      <Text className="text-2xl font-semibold mb-4">My Giveaways</Text>
      {giveaways.length === 0 ? (
        <View className="bg-white p-6 rounded-2xl items-center">
          <Text className="text-gray-600">You haven't created any giveaways yet.</Text>
        </View>
      ) : (
        <View className="gap-3">
          {giveaways.map((g) => (
            <View key={g.id} className="bg-white p-4 rounded-2xl">
              <Text className="font-semibold">{g.title}</Text>
              <Text className="text-gray-600 text-sm">Participants: {g.participantCount || 0}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
