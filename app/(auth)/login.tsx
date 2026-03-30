import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight } from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [error, setError] = useState("");
  const isFocused = useIsFocused();

  const router = useRouter();
  const { loginAsDemo } = useAuth();

  const handleLogin = async (
    emailStr: string,
    passwordStr: string,
    nameStr?: string,
  ) => {
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: emailStr,
          password: passwordStr,
          options: { data: { name: nameStr || emailStr.split("@")[0] } },
        });
        if (error) throw error;

        // Prevent auto-login by immediately destroying the session
        await supabase.auth.signOut();

        Alert.alert(
          "Success",
          "Account created successfully! Please sign in to continue.",
        );
        setIsSignUp(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailStr,
          password: passwordStr,
        });
        if (error) throw error;
        router.replace("/(app)" as any);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSubmit = () => {
    setError("");
    if (isSignUp && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    handleLogin(email.trim(), password, isSignUp ? name.trim() : undefined);
  };

  const switchMode = () => {
    setIsSignUp((v) => !v);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPwd(false);
    setShowConfirmPwd(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView key={isFocused ? 'focused' : 'not-focused'} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrap}>
          {/* Header */}
          <View style={styles.header}>
            <Animated.View entering={FadeInDown.delay(0).duration(600).springify()} style={styles.iconContainer}>
              <FontAwesome5 name="dumbbell" size={24} color="white" />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(50).duration(600).springify()}>
              <Text style={styles.title}>Gym Planner</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
              <Text style={styles.subtitle}>Your digital workout notebook</Text>
            </Animated.View>
          </View>

          {/* Card */}
          <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {isSignUp ? "Create Account" : "Welcome Back"}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isSignUp
                  ? "Sign up to start tracking your workouts"
                  : "Sign in to access your workouts"}
              </Text>
            </View>

            <View style={styles.cardBody}>
              {isSignUp && (
                <Animated.View entering={FadeInLeft.delay(300).duration(500).springify()} style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#717182"
                    value={name}
                    onChangeText={setName}
                  />
                </Animated.View>
              )}

              <Animated.View entering={FadeInLeft.delay(350).duration(500).springify()} style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#717182"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Animated.View>

              <Animated.View entering={FadeInRight.delay(400).duration(500).springify()} style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor="#717182"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPwd}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPwd(!showPwd)}
                  >
                    <Feather
                      name={showPwd ? "eye-off" : "eye"}
                      size={16}
                      color="#717182"
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {isSignUp && (
                <Animated.View entering={FadeInRight.delay(450).duration(500).springify()} style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="••••••••"
                      placeholderTextColor="#717182"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPwd}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPwd(!showConfirmPwd)}
                    >
                      <Feather
                        name={showConfirmPwd ? "eye-off" : "eye"}
                        size={16}
                        color="#717182"
                      />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}

              {/* Forgot Password Container, Error Text, Submit Button */}
              {!isSignUp && (
                <Animated.View entering={FadeInUp.delay(500).duration(500).springify()} style={styles.forgotPasswordContainer}>
                  <TouchableOpacity>
                    <Text style={styles.forgotPasswordText}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Animated.View entering={FadeInUp.delay(550).duration(600).springify()}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>
                    {isSignUp ? "Sign Up" : "Sign In"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <Animated.View entering={FadeInUp.delay(650).duration(600).springify()} style={styles.dividerContainer}>
                <View style={styles.divider} />
                <View style={styles.orContainer}>
                  <Text style={styles.orText}>OR</Text>
                </View>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(700).duration(600).springify()} style={styles.switchModeContainer}>
                <Text style={styles.switchModeText}>
                  {isSignUp
                    ? "Already have an account? "
                    : "Don't have an account? "}
                </Text>
                <TouchableOpacity onPress={switchMode}>
                  <Text style={styles.switchModeActionText}>
                    {isSignUp ? "Sign in" : "Sign up"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(750).duration(600).springify()}>
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={async () => {
                    try {
                      await loginAsDemo();
                      router.replace("/(app)" as any);
                    } catch (e: any) {
                      setError("Demo login failed");
                    }
                  }}
                >
                  <Text style={styles.demoButtonText}>Continue as Demo User</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(850).duration(600).springify()}>
            <Text style={styles.footerNote}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    paddingVertical: 32,
  },
  contentWrap: {
    width: "100%",
    maxWidth: 408,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#030213",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    color: "#0a0a0a",
    fontWeight: "700",
    lineHeight: 36,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#717182",
    fontWeight: "400",
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 14,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  cardTitle: {
    fontSize: 16,
    color: "#0a0a0a",
    fontWeight: "500",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#717182",
    fontWeight: "400",
    lineHeight: 20,
  },
  cardBody: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#0a0a0a",
    fontWeight: "500",
  },
  input: {
    height: 48,
    backgroundColor: "#f3f3f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 0,
    fontSize: 16,
    color: "#0a0a0a",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f5",
    borderRadius: 8,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    paddingVertical: 0,
    fontSize: 16,
    color: "#0a0a0a",
  },
  eyeButton: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#030213",
    fontWeight: "500",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
  },
  submitButton: {
    height: 48,
    backgroundColor: "#030213",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  cardFooter: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  dividerContainer: {
    position: "relative",
    justifyContent: "center",
    height: 16,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  orContainer: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "white",
    paddingHorizontal: 8,
  },
  orText: {
    fontSize: 12,
    color: "#717182",
  },
  switchModeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  switchModeText: {
    fontSize: 14,
    color: "#717182",
    fontWeight: "500",
  },
  switchModeActionText: {
    fontSize: 14,
    color: "#030213",
    fontWeight: "600",
  },
  demoButton: {
    height: 36,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  demoButtonText: {
    fontSize: 14,
    color: "#0a0a0a",
    fontWeight: "500",
  },
  footerNote: {
    fontSize: 12,
    color: "#717182",
    textAlign: "center",
    marginTop: 16,
  },
});
