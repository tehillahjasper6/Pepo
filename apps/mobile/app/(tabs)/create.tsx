import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../hooks/useAuth';
import { PepoBee } from '../../components/PepoBee';

export default function CreateScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Furniture');
  const [eligibility, setEligibility] = useState('ALL');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = ['Furniture', 'Clothing', 'Electronics', 'Toys', 'Books', 'Other'];
  const eligibilityOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
  ];

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload up to 5 images');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - images.length,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to post a giveaway');
      router.push('/auth/login');
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Images Required', 'Please add at least one image');
      return;
    }

    try {
      setLoading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('category', category);
      formData.append('eligibility', eligibility);

      // Append images
      images.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `image${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('images', {
          uri,
          name: filename,
          type,
        } as any);
      });

      await apiClient.createGiveaway(formData);
      
      // Show success animation
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form
        setTitle('');
        setDescription('');
        setLocation('');
        setImages([]);
        router.push('/(tabs)/browse');
      }, 2500);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to post giveaway');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background-default">
      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-3xl p-8 items-center">
            <PepoBee emotion="give" size={150} />
            <Text className="text-2xl font-bold mt-4 text-center">Giveaway Posted! 🎁</Text>
            <Text className="text-gray-600 mt-2 text-center">Your item is now live</Text>
          </View>
        </View>
      </Modal>

      <View className="p-6">
        <Text className="text-2xl font-semibold mb-6">Post a Giveaway 🎁</Text>

        {/* Image Upload */}
        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row gap-2">
              {images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    className="w-32 h-32 rounded-xl"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  >
                    <Text className="text-white text-xs">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity
                  onPress={pickImage}
                  className="w-32 h-32 bg-gray-100 rounded-xl items-center justify-center border-2 border-dashed border-gray-300"
                >
                  <Text className="text-3xl mb-1">📷</Text>
                  <Text className="text-gray-600 text-xs text-center">Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
          {images.length === 0 && (
            <TouchableOpacity
              onPress={pickImage}
              className="bg-gray-100 h-48 rounded-2xl items-center justify-center border-2 border-dashed border-gray-300"
            >
              <Text className="text-5xl mb-2">📷</Text>
              <Text className="text-gray-600">Tap to add photos (up to 5)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="font-medium mb-2">Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Vintage Bookshelf"
              className="bg-white px-4 py-3 rounded-xl border border-gray-200"
            />
          </View>

          <View>
            <Text className="font-medium mb-2">Description *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your item..."
              multiline
              numberOfLines={4}
              className="bg-white px-4 py-3 rounded-xl border border-gray-200 min-h-[100px]"
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text className="font-medium mb-2">Location *</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., New York, NY"
              className="bg-white px-4 py-3 rounded-xl border border-gray-200"
            />
          </View>

          <View>
            <Text className="font-medium mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full ${
                      category === cat
                        ? 'bg-primary-500'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <Text className={`font-medium ${
                      category === cat ? 'text-white' : 'text-gray-700'
                    }`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View>
            <Text className="font-medium mb-2">Eligibility</Text>
            <View className="flex-row gap-2 flex-wrap">
              {eligibilityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setEligibility(option.value)}
                  className={`px-4 py-2 rounded-full ${
                    eligibility === option.value
                      ? 'bg-primary-500'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <Text className={`font-medium ${
                    eligibility === option.value ? 'text-white' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`bg-primary-500 rounded-2xl py-4 mt-8 ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-center text-lg">
              Post Giveaway
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

