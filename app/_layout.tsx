import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { WorkoutProvider } from "../contexts/WorkoutContext";
import { TemplateProvider } from "../contexts/TemplateContext";

import { SettingsProvider } from "../contexts/SettingsContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <WorkoutProvider>
          <TemplateProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </TemplateProvider>
        </WorkoutProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
