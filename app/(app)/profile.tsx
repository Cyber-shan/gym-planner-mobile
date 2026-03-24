import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // Navigate back to auth flow
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your account and settings</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  }
});
