import { Link } from "expo-router";
import { Text, View } from 'react-native';

const SignIn = () => {
  return (
    <View>
      <Text>Sign In</Text>
       <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">
        Sign Up     
      </Link>
    </View>
  )
}

export default SignIn