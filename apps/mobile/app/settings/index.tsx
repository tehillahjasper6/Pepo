import { View, Text, ScrollView, Switch } from 'react-native';
import { useState } from 'react';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <ScrollView className="flex-1 bg-background-default p-4">
      <Text className="text-2xl font-semibold mb-4">Settings</Text>
      <View className="bg-white p-4 rounded-2xl">
        <View className="flex-row justify-between items-center">
          <Text className="font-medium">Push Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>
      </View>
    </ScrollView>
  );
}
