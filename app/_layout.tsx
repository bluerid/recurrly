import '@/global.css';
import { ClerkProvider, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { PostHogErrorBoundary, PostHogProvider } from 'posthog-react-native';
import { useEffect, useRef } from "react";

import { posthog } from '@/lib/posthog';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Clerk Publishable Key. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env'
  );
}

function PostHogIdentity() {
  const { isLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      identifiedUserId.current = null;
      return;
    }

    if (identifiedUserId.current === user.id) return;

    const personProperties: Record<string, string> = {};
    const email = user.primaryEmailAddress?.emailAddress;

    if (email) personProperties.email = email;
    if (user.fullName) personProperties.name = user.fullName;

    posthog?.identify(user.id, { $set: personProperties });
    identifiedUserId.current = user.id;
  }, [isLoaded, user]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')
  })
  useEffect(() => {
    // Hide splash only when fonts are loaded
    if (fontsLoaded ) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  // Don't render app until fonts are ready
  if (!fontsLoaded ) return null;
  
  const app = <Stack screenOptions={{ headerShown: false }} />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider client={posthog} autocapture={{ captureScreens: false }}>
          <PostHogIdentity />
          <PostHogErrorBoundary fallback={() => null}>
            {app}
          </PostHogErrorBoundary>
        </PostHogProvider>
      ) : (
        app
      )}
    </ClerkProvider>
  );
}
