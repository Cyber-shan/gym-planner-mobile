import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { TemplateProvider } from "../contexts/TemplateContext";
import { WorkoutProvider } from "../contexts/WorkoutContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SettingsProvider>
          <WorkoutProvider>
            <TemplateProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </TemplateProvider>
          </WorkoutProvider>
        </SettingsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
