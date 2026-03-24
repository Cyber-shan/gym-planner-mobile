import { Redirect } from 'expo-router';

export default function Index() {
  // Start the user in the auth flow by default
  return <Redirect href="/(auth)/login" />;
}
