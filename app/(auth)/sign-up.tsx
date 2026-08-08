import { useAuth, useClerk, useSignUp } from '@clerk/expo';
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

const extractClerkMessage = (err: unknown, fallback: string): string => {
  if (isClerkAPIError(err) && err.errors?.[0]?.message) {
    return err.errors[0].message;
  }
  return fallback;
};

const SignUp = () => {
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Validation
  const emailValid = emailAddress.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  const passwordMinLength = password.length >= 8;
  const passwordHasUpperCase = /[A-Z]/.test(password);
  const passwordHasNumber = /[0-9]/.test(password);
  const formValid = emailAddress.length > 0 && passwordMinLength && emailValid;

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Redirect signed-in users away from sign-up via effect (not during render)
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

  const handleSignUp = async () => {
    if (!formValid || !signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      await signUp.create({ emailAddress, password });

      // Send verification email
      await signUp.verifications.sendEmailCode();

      setIsVerifying(true);
      setShowVerification(true);
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(extractClerkMessage(err, 'Failed to create account'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6 || !signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      // Verify email code
      await signUp.verifications.verifyEmailCode({ code });

      // Check if sign-up is complete and finalize if needed
      if (signUp.status === 'complete') {
        const sessionId = signUp.createdSessionId;
        if (sessionId) {
          await setActive({ session: sessionId });
          router.replace('/(tabs)');
        }
      } else {
        setError(`Sign up incomplete (${signUp.status}). Please try again.`);
      }
    } catch (err: unknown) {
      setError(extractClerkMessage(err, 'Verification failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      await signUp.verifications.sendEmailCode();
      setResendCooldown(60);
    } catch {
      setError('Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification && isVerifying) {
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
                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  We sent a verification code to{'\n'}
                  <Text className="font-sans-bold text-primary">{emailAddress}</Text>
                </Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  {error && (
                    <View className="rounded-2xl border border-destructive bg-destructive/10 p-3">
                      <Text className="text-sm font-sans-semibold text-destructive">{error}</Text>
                    </View>
                  )}

                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className="auth-input"
                      value={code}
                      placeholder="000000"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      autoComplete="one-time-code"
                      maxLength={6}
                      editable={!isLoading}
                      autoFocus
                    />
                  </View>

                  <Pressable
                    className={`auth-button ${(!code || isLoading) && 'auth-button-disabled'}`}
                    onPress={handleVerify}
                    disabled={!code || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#081126" size="small" />
                    ) : (
                      <Text className="auth-button-text">Verify email</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={handleResendCode}
                    disabled={resendCooldown > 0 || isLoading}
                  >
                    <Text className="auth-secondary-button-text">
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive it? Resend"}
                    </Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => {
                      setShowVerification(false);
                      setIsVerifying(false);
                      setCode('');
                      setError(null);
                    }}
                    disabled={isLoading}
                  >
                    <Text className="auth-secondary-button-text">Back to sign up</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

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
              <Text className="auth-title">Create your account</Text>
              <Text className="auth-subtitle">Start tracking your subscriptions and never miss a payment</Text>
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
                    className={`auth-input ${passwordTouched && !passwordMinLength && 'auth-input-error'}`}
                    value={password}
                    placeholder="Create a strong password"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    secureTextEntry
                    onChangeText={setPassword}
                    onBlur={() => setPasswordTouched(true)}
                    autoComplete="password-new"
                    editable={!isLoading}
                  />
                  {passwordTouched && !passwordMinLength && (
                    <Text className="auth-error">Password must be at least 8 characters</Text>
                  )}
                  {password.length > 0 && !passwordTouched && (
                    <View className="gap-1">
                      <Text className={`text-xs font-sans-medium ${passwordMinLength ? 'text-success' : 'text-muted-foreground'}`}>
                        {passwordMinLength ? '✓' : '○'} At least 8 characters
                      </Text>
                      <Text className={`text-xs font-sans-medium ${passwordHasUpperCase ? 'text-success' : 'text-muted-foreground'}`}>
                        {passwordHasUpperCase ? '✓' : '○'} Uppercase letter
                      </Text>
                      <Text className={`text-xs font-sans-medium ${passwordHasNumber ? 'text-success' : 'text-muted-foreground'}`}>
                        {passwordHasNumber ? '✓' : '○'} Number
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${(!formValid || isLoading) && 'auth-button-disabled'}`}
                  onPress={handleSignUp}
                  disabled={!formValid || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </Pressable>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable disabled={isLoading}>
                  <Text className="auth-link">Sign in</Text>
                </Pressable>
              </Link>
            </View>

            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
