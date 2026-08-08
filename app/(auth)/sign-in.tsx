import { useAuth, useClerk, useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const isClerkAPIError = (err: unknown): err is { errors?: Array<{ message?: string }> } =>
  typeof err === 'object' && err !== null && 'errors' in err;

const extractClerkMessage = (err: unknown): string => {
  if (isClerkAPIError(err) && err.errors?.[0]?.message) {
    return err.errors[0].message;
  }
  return 'Failed to sign in';
};

const SignIn = () => {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const emailValid = emailAddress.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  const passwordValid = password.length > 0;
  const formValid = emailAddress.length > 0 && passwordValid && emailValid;

  // Redirect signed-in users away from sign-in via effect (not during render)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="auth-safe-area">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ea7a53" />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoaded && isSignedIn) {
    return null;
  }

  const handleSignIn = async () => {
    if (!formValid || !signIn) return;

    setIsLoading(true);
    setError(null);

    try {
      await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signIn.status === 'complete') {
        const sessionId = signIn.createdSessionId;
        if (sessionId) {
          await setActive({ session: sessionId });
          router.replace('/(tabs)');
        } else {
          setError('Sign in failed. Please try again.');
        }
      } else if (signIn.status === 'needs_second_factor') {
        // 2FA required — route to verify when available
        setError('Two-factor verification required.');
      } else {
        setError(`Sign in incomplete (${signIn.status}). Please try again.`);
      }
    } catch (err: unknown) {
      setError(extractClerkMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="auth-screen"
      >
        <ScrollView className="auth-scroll" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">SMART BILLING</Text>
                </View>
              </View>
              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">Sign in to continue managing your subscriptions</Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                {error && (
                  <View className="rounded-2xl border border-destructive bg-destructive/10 p-3">
                    <Text className="text-sm font-sans-semibold text-destructive">{error}</Text>
                  </View>
                )}

                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={`auth-input ${emailTouched && !emailValid && 'auth-input-error'}`}
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    onChangeText={setEmailAddress}
                    onBlur={() => setEmailTouched(true)}
                    keyboardType="email-address"
                    autoComplete="email"
                    editable={!isLoading}
                  />
                  {emailTouched && !emailValid && (
                    <Text className="auth-error">Please enter a valid email address</Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${passwordTouched && !passwordValid && 'auth-input-error'}`}
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    secureTextEntry
                    onChangeText={setPassword}
                    onBlur={() => setPasswordTouched(true)}
                    autoComplete="password"
                    editable={!isLoading}
                  />
                  {passwordTouched && !passwordValid && (
                    <Text className="auth-error">Password is required</Text>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${(!formValid || isLoading) && 'auth-button-disabled'}`}
                  onPress={handleSignIn}
                  disabled={!formValid || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurly?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable disabled={isLoading}>
                  <Text className="auth-link">Create an account</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
