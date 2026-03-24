import { View, Text, StyleSheet } from 'react-native';

export default function TemplatesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Templates</Text>
      <Text style={styles.subtitle}>Your workout templates will appear here</Text>
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
  }
});
