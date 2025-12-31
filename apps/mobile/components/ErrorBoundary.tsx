import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component for Mobile App
 * Catches and handles React component errors gracefully
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to error tracking service (e.g., Sentry)
    // Sentry.captureException(error);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView className="flex-1 bg-background-default">
          <View className="flex-1 items-center justify-center p-6 pt-20">
            {/* Error Icon */}
            <Text className="text-7xl mb-4">⚠️</Text>

            {/* Error Title */}
            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              Oops!
            </Text>

            {/* Error Message */}
            <Text className="text-gray-600 text-center mb-6 text-base leading-6">
              Something went wrong. The app encountered an unexpected error.
            </Text>

            {/* Error Details */}
            {__DEV__ && this.state.error && (
              <View className="bg-red-50 rounded-lg p-4 mb-6 w-full border border-red-200">
                <Text className="text-xs font-mono text-red-800 mb-2">
                  {this.state.error.message}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="w-full gap-3">
              <TouchableOpacity
                onPress={this.resetError}
                className="bg-primary-500 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-semibold text-lg">
                  Try Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  this.resetError();
                  // Navigate home
                  const router = require('expo-router').useRouter();
                  // This is a limitation - we can't use hooks in class components
                  // Use the window to store router reference if needed
                }}
                className="border border-primary-500 py-4 rounded-xl items-center"
              >
                <Text className="text-primary-500 font-semibold text-lg">
                  Go Home
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pepo Message */}
            <View className="mt-10 text-center">
              <Text className="text-6xl mb-2">🐝</Text>
              <Text className="text-gray-600 italic text-center">
                "Don't worry! This usually fixes itself. Try again or restart the app."
              </Text>
            </View>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional Error Boundary Component for use with hooks
 */
export function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-background-default">
      <View className="flex-1 items-center justify-center p-6 pt-20">
        <Text className="text-7xl mb-4">⚠️</Text>
        <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
          Something Went Wrong
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          {error.message || 'An unexpected error occurred'}
        </Text>

        <View className="w-full gap-3">
          <TouchableOpacity
            onPress={resetError}
            className="bg-primary-500 py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className="border border-primary-500 py-4 rounded-xl items-center"
          >
            <Text className="text-primary-500 font-semibold">Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
