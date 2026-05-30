import { Link, useLocalSearchParams } from 'expo-router';
import { styled } from "nativewind";
import { Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text>Subscription Details { id }</Text>
      <Link href="/">Go Back</Link>
    </SafeAreaView>
  )
}

export default SubscriptionDetails