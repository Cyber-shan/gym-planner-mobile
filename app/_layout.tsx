import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { WorkoutProvider } from "../contexts/WorkoutContext";
import { TemplateProvider } from "../contexts/TemplateContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <TemplateProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </TemplateProvider>
      </WorkoutProvider>
    </AuthProvider>
  );
}
