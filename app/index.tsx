import { useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { SplashScreen } from '../components/SplashScreen';

export default function Index() {
  const { user, isInitialized } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  // Show splash screen first
  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

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
