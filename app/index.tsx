import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return (
      <View style={{flex: 1, justifyContent: 'center', backgroundColor: '#ffffff'}}>
        <ActivityIndicator size="large" color="#030213" />
      </View>
    );
  }
  
  if (user) {
    return <Redirect href="/(app)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
