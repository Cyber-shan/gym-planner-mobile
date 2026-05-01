import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleResetRequest = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'loglift://reset-password',
      });

      if (error) throw error;

      setSuccess(true);
      Alert.alert(
        "Reset Email Sent",
        "Please check your inbox for the password reset link.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (e: any) {
      setError(e.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrap}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#0a0a0a" />
            </TouchableOpacity>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="key" size={24} color="white" />
            </View>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we&apos;ll send you a link to reset your password.
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#717182"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading && !success}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {success ? (
                <Text style={styles.successText}>
                  Reset link sent! Check your email.
                </Text>
              ) : null}

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleResetRequest}
                disabled={loading || success}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
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
    fontSize: 24,
    color: "#0a0a0a",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: "#717182",
    fontWeight: "400",
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 14,
    overflow: "hidden",
  },
  cardBody: {
    padding: 24,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 8,
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
    fontSize: 16,
    color: "#0a0a0a",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
  },
  successText: {
    color: "#10b981",
    fontSize: 14,
    textAlign: "center",
    fontWeight: '500',
  },
  submitButton: {
    height: 48,
    backgroundColor: "#030213",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  backToLoginText: {
    fontSize: 14,
    color: "#030213",
    fontWeight: "600",
  },
});
