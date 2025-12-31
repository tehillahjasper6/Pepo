import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function MyParticipationsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipations();
  }, []);

  const fetchParticipations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getMyParticipations();
      const list = (res && (res.participations || res)) || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to load participations', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background-default items-center justify-center">
        <ActivityIndicator size="large" color="#F4B400" />
        <Text className="text-gray-600 mt-4">Loading your participations...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background-default p-4">
      <Text className="text-2xl font-semibold mb-4">My Participations</Text>
      {items.length === 0 ? (
        <View className="bg-white p-6 rounded-2xl items-center">
          <Text className="text-gray-600">You haven't participated in any giveaways yet.</Text>
        </View>
      ) : (
        <View className="gap-3">
          {items.map((g) => (
            <View key={g.id} className="bg-white p-4 rounded-2xl">
              <Text className="font-semibold">{g.title || g.giveawayTitle}</Text>
              <Text className="text-gray-600 text-sm">Status: {g.status || 'Active'}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
