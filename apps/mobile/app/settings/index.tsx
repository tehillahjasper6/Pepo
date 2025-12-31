import { View, Text, ScrollView, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export default function SettingsScreen() {
  const { isEnabled, isLoading, settings, enableNotifications, disableNotifications } = usePushNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    setNotificationsEnabled(isEnabled);
  }, [isEnabled]);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      await disableNotifications();
      setNotificationsEnabled(false);
    } else {
      const success = await enableNotifications();
      if (success) {
        setNotificationsEnabled(true);
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-background-default p-4">
      <Text className="text-2xl font-semibold mb-6">Settings ⚙️</Text>

      {/* Notifications Section */}
      <View className="bg-white p-4 rounded-2xl mb-4">
        <Text className="font-semibold text-lg mb-4">Notifications 🔔</Text>

        {/* Main Toggle */}
        <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
          <Text className="font-medium">Push Notifications</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#F4B400" />
          ) : (
            <Switch 
              value={notificationsEnabled} 
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#e5e7eb', true: '#F4B400' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#f3f4f6'}
            />
          )}
        </View>

        {notificationsEnabled && (
          <View className="gap-3">
            <View className="flex-row justify-between items-center pb-3 border-b border-gray-100">
              <Text className="text-gray-700">Giveaway Updates</Text>
              <Switch 
                value={settings.giveawayUpdates} 
                onValueChange={(value) => {
                  // Will update via hook in next version
                }}
                trackColor={{ false: '#e5e7eb', true: '#F4B400' }}
              />
            </View>

            <View className="flex-row justify-between items-center pb-3 border-b border-gray-100">
              <Text className="text-gray-700">New Messages</Text>
              <Switch 
                value={settings.messages} 
                onValueChange={(value) => {
                  // Will update via hook in next version
                }}
                trackColor={{ false: '#e5e7eb', true: '#F4B400' }}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Draw Results</Text>
              <Switch 
                value={settings.draws} 
                onValueChange={(value) => {
                  // Will update via hook in next version
                }}
                trackColor={{ false: '#e5e7eb', true: '#F4B400' }}
              />
            </View>
          </View>
        )}

        {notificationsEnabled && (
          <Text className="text-xs text-gray-500 mt-4 text-center">
            ✓ Push notifications are enabled
          </Text>
        )}
      </View>

      {/* App Info */}
      <View className="bg-white p-4 rounded-2xl">
        <Text className="font-semibold text-lg mb-4">About 📱</Text>
        <View className="gap-3">
          <View className="flex-row justify-between pb-3 border-b border-gray-100">
            <Text className="text-gray-700">App Version</Text>
            <Text className="font-semibold">1.0.0</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-700">Platform</Text>
            <Text className="font-semibold">Expo/React Native</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
