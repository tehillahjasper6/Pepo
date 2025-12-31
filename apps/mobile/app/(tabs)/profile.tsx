import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ given: 0, received: 0, participated: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    } else {
      router.replace('/auth/login');
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        apiClient.getMyProfile(),
        apiClient.getMyStats(),
      ]);
      setProfile(profileData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleMenuItemPress = (screen: string) => {
    switch (screen) {
      case 'My Giveaways':
        router.push('/my-giveaways');
        break;
      case 'My Participations':
        router.push('/my-participations');
        break;
      case 'My Wins':
        router.push('/my-wins');
        break;
      case 'Settings':
        router.push('/settings');
        break;
      default:
        Alert.alert('Coming Soon', `${screen} screen will be available soon!`);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background-default items-center justify-center">
        <ActivityIndicator size="large" color="#F4B400" />
        <Text className="text-gray-600 mt-4">Loading profile...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !profile) {
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

  return (
    <ScrollView className="flex-1 bg-background-default">
      {/* Profile Header */}
      <View className="bg-primary-500 p-6 rounded-b-3xl">
        <View className="items-center">
          {profile.avatar ? (
            <Image
              source={{ uri: profile.avatar }}
              className="w-24 h-24 rounded-full mb-4"
            />
          ) : (
            <View className="w-24 h-24 bg-white rounded-full mb-4 items-center justify-center">
              <Text className="text-5xl">👤</Text>
            </View>
          )}
          <Text className="text-white text-2xl font-bold">{profile.name || 'User'}</Text>
          <Text className="text-white/80">{profile.city || 'Location not set'}</Text>
        </View>
      </View>

      {/* Stats */}
      <View className="p-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="font-semibold text-lg mb-4">Your Impact</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-3xl font-bold text-primary-500">{stats.given}</Text>
              <Text className="text-gray-600 text-sm">Given</Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-secondary-500">{stats.received}</Text>
              <Text className="text-gray-600 text-sm">Received</Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-info-500">{stats.participated}</Text>
              <Text className="text-gray-600 text-sm">Participated</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <MenuItem
            icon="🎁"
            title="My Giveaways"
            onPress={() => handleMenuItemPress('My Giveaways')}
          />
          <MenuItem
            icon="✋"
            title="My Participations"
            onPress={() => handleMenuItemPress('My Participations')}
          />
          <MenuItem
            icon="🏆"
            title="My Wins"
            onPress={() => handleMenuItemPress('My Wins')}
          />
          <MenuItem
            icon="⚙️"
            title="Settings"
            onPress={() => handleMenuItemPress('Settings')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <Text className="text-red-500 font-semibold text-center">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 border-b border-gray-100"
    >
      <Text className="text-2xl mr-3">{icon}</Text>
      <Text className="flex-1 font-medium">{title}</Text>
      <Text className="text-gray-400">›</Text>
    </TouchableOpacity>
  );
}

