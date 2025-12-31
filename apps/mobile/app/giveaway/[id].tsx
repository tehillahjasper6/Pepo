import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../hooks/useAuth';
import { PepoBee } from '../../components/PepoBee';

export default function GiveawayDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [giveaway, setGiveaway] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasExpressed, setHasExpressed] = useState(false);
  const [showDraw, setShowDraw] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchGiveaway();
    }
  }, [id]);

  const fetchGiveaway = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getGiveaway(id!);
      const giveawayData = response.giveaway || response;
      setGiveaway(giveawayData);
      
      // Check if user has expressed interest
      if (giveawayData.participants && user) {
        const isParticipant = giveawayData.participants.some(
          (p: any) => p.userId === user.id
        );
        setHasExpressed(isParticipant);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load giveaway');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to express interest');
      router.push('/auth/login');
      return;
    }

    try {
      await apiClient.expressInterest(id!);
      setHasExpressed(true);
      setGiveaway({
        ...giveaway,
        participantCount: (giveaway?.participantCount || 0) + 1,
      });
      Alert.alert('Success!', '✋ You\'re in the draw! Good luck!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to express interest');
    }
  };

  const handleWithdraw = async () => {
    try {
      await apiClient.withdrawInterest(id!);
      setHasExpressed(false);
      setGiveaway({
        ...giveaway,
        participantCount: Math.max((giveaway?.participantCount || 1) - 1, 0),
      });
      Alert.alert('Withdrawn', 'Your interest has been withdrawn');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to withdraw interest');
    }
  };

  const handleDraw = async () => {
    if (!giveaway) return;

    Alert.alert(
      'Draw Winner',
      'Are you ready to select a winner? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Draw Now',
          onPress: async () => {
            try {
              setDrawing(true);
              setShowDraw(true);
              
              const result = await apiClient.conductDraw(id!);
              
              setTimeout(() => {
                setDrawing(false);
                setWinner(result.winner?.name || 'Winner');
                setGiveaway({
                  ...giveaway,
                  status: 'CLOSED',
                });
              }, 2000);
            } catch (error: any) {
              setDrawing(false);
              setShowDraw(false);
              Alert.alert('Error', error.message || 'Failed to conduct draw');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background-default items-center justify-center">
        <PepoBee emotion="loading" size={120} />
        <Text className="text-gray-600 mt-4">Loading giveaway...</Text>
      </View>
    );
  }

  if (!giveaway) {
    return (
      <View className="flex-1 bg-background-default items-center justify-center p-6">
        <Text className="text-6xl mb-4">❌</Text>
        <Text className="text-xl font-semibold mb-2">Giveaway Not Found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary-500 px-6 py-3 rounded-full mt-4"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCreator = user?.id === giveaway.userId || user?.id === giveaway.creator?.id;
  const mainImage = giveaway.images?.[0];
  const otherImages = giveaway.images?.slice(1, 5) || [];

  return (
    <ScrollView className="flex-1 bg-background-default">
      {/* Winner Celebration Modal */}
      <Modal visible={!!winner} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white rounded-3xl p-8 items-center max-w-sm">
            <PepoBee emotion="celebrate" size={150} />
            <Text className="text-2xl font-bold text-center mb-2 mt-4">Winner Selected!</Text>
            <Text className="text-xl text-primary-500 font-semibold mb-4">{winner}</Text>
            <TouchableOpacity
              onPress={() => {
                setWinner(null);
                router.back();
              }}
              className="bg-primary-500 px-8 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Draw Loading Modal */}
      <Modal visible={showDraw} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-3xl p-8 items-center">
            <PepoBee emotion="loading" size={150} />
            <Text className="text-xl font-semibold mt-4">Drawing a winner...</Text>
            <Text className="text-gray-600 mt-2">Please wait</Text>
          </View>
        </View>
      </Modal>

      {/* Header Image */}
      {mainImage ? (
        <Image
          source={{ uri: mainImage }}
          className="w-full h-80"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-80 bg-gray-100 items-center justify-center">
          <Text className="text-8xl">
            {giveaway.category === 'Furniture' ? '🪑' :
             giveaway.category === 'Clothing' ? '👕' :
             giveaway.category === 'Electronics' ? '💻' :
             giveaway.category === 'Toys' ? '🧸' :
             giveaway.category === 'Books' ? '📚' : '📦'}
          </Text>
        </View>
      )}

      {/* Thumbnail Images */}
      {otherImages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-2 bg-gray-50"
        >
          {otherImages.map((img: string, idx: number) => (
            <Image
              key={idx}
              source={{ uri: img }}
              className="w-20 h-20 rounded-xl mr-2"
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      <View className="p-6">
        {/* Title and Meta */}
        <View className="mb-4">
          <Text className="text-3xl font-bold text-gray-900 mb-2">{giveaway.title}</Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-row items-center">
              <Text className="text-lg mr-1">📍</Text>
              <Text className="text-gray-600">{giveaway.location}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-lg mr-1">🏷️</Text>
              <Text className="text-gray-600">{giveaway.category}</Text>
            </View>
          </View>
        </View>

        {/* Status Card */}
        <View className="bg-primary-50 rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm text-gray-600 mb-1">Status</Text>
              <Text className="text-2xl font-bold text-primary-600">
                {giveaway.status}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm text-gray-600 mb-1">Interested</Text>
              <Text className="text-2xl font-bold text-gray-900">
                {giveaway.participantCount || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Description</Text>
          <Text className="text-gray-700 leading-6">{giveaway.description}</Text>
        </View>

        {/* Creator Info */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-sm text-gray-600 mb-2">Giver</Text>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
              <Text className="text-2xl">👤</Text>
            </View>
            <View>
              <Text className="font-semibold text-lg">
                {giveaway.creator?.name || giveaway.user?.name || 'Anonymous'}
              </Text>
              <Text className="text-gray-600">
                {giveaway.creator?.city || giveaway.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="space-y-3 mb-6">
          {!hasExpressed ? (
            <TouchableOpacity
              onPress={handleExpressInterest}
              className="bg-primary-500 rounded-2xl py-4"
            >
              <Text className="text-white font-semibold text-center text-lg">
                ✋ Express Interest
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <View className="bg-secondary-50 rounded-2xl p-6 items-center">
                <PepoBee emotion="idle" size={80} />
                <Text className="font-semibold text-secondary-700 text-lg mb-1 mt-2">
                  You're in the draw!
                </Text>
                <Text className="text-gray-600 text-center">
                  Good luck! You'll be notified if selected.
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleWithdraw}
                className="bg-gray-200 rounded-2xl py-4"
              >
                <Text className="text-gray-700 font-semibold text-center text-lg">
                  Withdraw Interest
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Creator-only actions */}
          {isCreator && giveaway.status === 'OPEN' && (
            <TouchableOpacity
              onPress={handleDraw}
              className="bg-secondary-500 rounded-2xl py-4"
            >
              <Text className="text-white font-semibold text-center text-lg">
                🎲 Draw Winner Now
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Trust Message */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start">
            <Text className="text-2xl mr-3">🛡️</Text>
            <View className="flex-1">
              <Text className="font-semibold mb-1 text-gray-900">Fair & Random Selection</Text>
              <Text className="text-sm text-gray-700">
                Winners are chosen using cryptographically secure random selection. 
                All draws are logged and auditable.
              </Text>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-xl font-semibold mb-4">How PEPO Works</Text>
          <View className="space-y-6">
            <HowItWorksStep
              number="1"
              icon="✋"
              title="Express Interest"
              description="Click the button to enter the draw for this item"
            />
            <HowItWorksStep
              number="2"
              icon="🎲"
              title="Random Selection"
              description="Winner is chosen fairly at random when the giver is ready"
            />
            <HowItWorksStep
              number="3"
              icon="📦"
              title="Coordinate Pickup"
              description="Connect with the giver to arrange pickup details"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function HowItWorksStep({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View className="items-center">
      <View className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center mb-3">
        <Text className="text-white font-bold text-lg">{number}</Text>
      </View>
      <Text className="text-4xl mb-2">{icon}</Text>
      <Text className="font-semibold text-lg mb-1">{title}</Text>
      <Text className="text-gray-600 text-center text-sm">{description}</Text>
    </View>
  );
}

