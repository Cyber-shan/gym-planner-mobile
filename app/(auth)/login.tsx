import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [isSignUp, setIsSignUp]   = useState(false);
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState("");
  
  const router = useRouter();

  const handleLogin = (emailStr: string, passwordStr: string, nameStr?: string) => {
    console.log("Logging in as:", emailStr);
    router.replace('/(app)' as any);
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
    handleLogin(email.trim(), password, isSignUp ? name.trim() : undefined);
  };

  const switchMode = () => {
    setIsSignUp(v => !v);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrap}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="dumbbell" size={24} color="white" />
            </View>
            <Text style={styles.title}>Gym Planner</Text>
            <Text style={styles.subtitle}>Your digital workout notebook</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{isSignUp ? "Create Account" : "Welcome Back"}</Text>
              <Text style={styles.cardSubtitle}>
                {isSignUp ? "Sign up to start tracking your workouts" : "Sign in to access your workouts"}
              </Text>
            </View>

            <View style={styles.cardBody}>
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#717182"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
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
              </View>

              <View style={styles.inputGroup}>
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
                  <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPwd(!showPwd)}>
                    <Feather name={showPwd ? "eye-off" : "eye"} size={16} color="#717182" />
                  </TouchableOpacity>
                </View>
              </View>

              {!isSignUp && (
                <View style={styles.forgotPasswordContainer}>
                  <TouchableOpacity>
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <View style={styles.orContainer}>
                  <Text style={styles.orText}>OR</Text>
                </View>
              </View>

              <View style={styles.switchModeContainer}>
                <Text style={styles.switchModeText}>
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                </Text>
                <TouchableOpacity onPress={switchMode}>
                  <Text style={styles.switchModeActionText}>{isSignUp ? "Sign in" : "Sign up"}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.demoButton} 
                onPress={() => handleLogin("demo@example.com", "demo", "Demo User")}
              >
                <Text style={styles.demoButtonText}>Continue as Demo User</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footerNote}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    paddingVertical: 32,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 408,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#030213',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    color: '#0a0a0a',
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#717182',
    fontWeight: '400',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  cardTitle: {
    fontSize: 16,
    color: '#0a0a0a',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#717182',
    fontWeight: '400',
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
    color: '#0a0a0a',
    fontWeight: '500',
  },
  input: {
    height: 36,
    backgroundColor: '#f3f3f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0a0a0a',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f5',
    borderRadius: 8,
    height: 36,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0a0a0a',
  },
  eyeButton: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#030213',
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    height: 40,
    backgroundColor: '#030213',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  dividerContainer: {
    position: 'relative',
    justifyContent: 'center',
    height: 16,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  orContainer: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
  },
  orText: {
    fontSize: 12,
    color: '#717182',
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchModeText: {
    fontSize: 14,
    color: '#717182',
    fontWeight: '500',
  },
  switchModeActionText: {
    fontSize: 14,
    color: '#030213',
    fontWeight: '600',
  },
  demoButton: {
    height: 36,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtonText: {
    fontSize: 14,
    color: '#0a0a0a',
    fontWeight: '500',
  },
  footerNote: {
    fontSize: 12,
    color: '#717182',
    textAlign: 'center',
    marginTop: 16,
  }
});
