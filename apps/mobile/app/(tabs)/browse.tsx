import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '../../lib/apiClient';
import { PepoBee } from '../../components/PepoBee';

export default function BrowseScreen() {
  const router = useRouter();
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchGiveaways();
  }, [filter]);

  const fetchGiveaways = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { category: filter } : {};
      const response = await apiClient.getGiveaways(params);
      setGiveaways(response.giveaways || []);
    } catch (error) {
      console.error('Failed to fetch giveaways:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Furniture', 'Clothing', 'Electronics', 'Toys', 'Books'];

  return (
    <ScrollView className="flex-1 bg-background-default">
      <View className="p-4">
        <Text className="text-2xl font-semibold mb-4">Browse Giveaways</Text>
        
        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full ${
                  filter === cat
                    ? 'bg-primary-500'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <Text className={`font-medium ${
                  filter === cat ? 'text-white' : 'text-gray-700'
                }`}>
                  {cat === 'all' ? 'All' : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Giveaway List */}
        {loading ? (
          <View className="items-center py-20">
            <PepoBee emotion="loading" size={120} />
            <Text className="text-gray-600 mt-4">Loading giveaways...</Text>
          </View>
        ) : giveaways.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center">
            <PepoBee emotion="idle" size={120} />
            <Text className="text-gray-500 text-center mb-2 mt-4">
              {filter !== 'all' ? `No ${filter} giveaways yet` : 'No giveaways available yet'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/create')}
              className="bg-primary-500 px-6 py-3 rounded-full mt-4"
            >
              <Text className="text-white font-semibold">Post First Giveaway</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-4">
            {giveaways.map((giveaway) => (
              <TouchableOpacity
                key={giveaway.id}
                onPress={() => router.push(`/giveaway/${giveaway.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                {giveaway.images && giveaway.images.length > 0 ? (
                  <Image
                    source={{ uri: giveaway.images[0] }}
                    className="w-full h-48 rounded-xl mb-3"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-48 bg-gray-100 rounded-xl mb-3 items-center justify-center">
                    <Text className="text-5xl">
                      {giveaway.category === 'Furniture' ? '🪑' :
                       giveaway.category === 'Clothing' ? '👕' :
                       giveaway.category === 'Electronics' ? '💻' :
                       giveaway.category === 'Toys' ? '🧸' :
                       giveaway.category === 'Books' ? '📚' : '📦'}
                    </Text>
                  </View>
                )}
                <Text className="text-lg font-semibold mb-1">{giveaway.title}</Text>
                <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                  {giveaway.description}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-500 text-xs">📍 {giveaway.location}</Text>
                  <Text className="text-primary-600 text-xs font-medium">
                    {giveaway.participantCount || 0} interested
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

