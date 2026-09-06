import images from '@/constants/images';
import { useClerk, useUser } from '@clerk/expo';
import { styled } from "nativewind";
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import { posthog } from '@/lib/posthog';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOut();
    posthog?.capture('user_signed_out');
    posthog?.reset();
  };

  const displayName = user?.firstName || user?.lastName || user?.username || 'User';
  const email = user?.emailAddresses[0]?.emailAddress || '';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-sans-bold mt-2 mb-6">Settings</Text>

        {/* User Profile Card */}
        <View className="settings-card rounded-2xl p-5 mb-6 flex-row items-center">
          <Image 
            source={{ uri: user?.imageUrl || images.avatar }}
            className="w-16 h-16 rounded-full mr-4"
  />
          <View className="flex-1">
            <Text className="text-2xl font-sans-bold text-primary">{displayName}</Text>
            <Text className="text-sm text-gray-500">{email}</Text>
          </View>
        </View>

        {/* Account Section */}
        <View className="settings-card rounded-2xl p-5 mb-6">
          <Text className="text-lg font-sans-semibold mb-4 text-primary">Account</Text>
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-gray-500">Account ID</Text>
            <Text className="text-sm font-sans-medium text-primary" numberOfLines={1}>
              {user?.id}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Joined</Text>
            <Text className="text-sm font-sans-medium text-primary">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-GB')
                : ''}
            </Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <Pressable 
          className="w-full p-4 bg-accent rounded-2xl items-center mt-4"
          onPress={handleSignOut}
        >
          <Text className="text-white font-sans-semibold">Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;