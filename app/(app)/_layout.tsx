import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkouts } from '../../contexts/WorkoutContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';
import ChatFAB from '../../components/ChatFAB';
import ChatBot from '../../components/ChatBot';
import { useState } from 'react';

// Custom Header Component based on your design
function AppHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const initials = user?.name 
    ? user.name.charAt(0).toUpperCase() 
    : user?.email 
      ? user.email.charAt(0).toUpperCase() 
      : "U";

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.headerContent}>
        {/* Logo Section */}
        <TouchableOpacity style={styles.logoButton} onPress={() => router.push('/(app)')}>
          <View style={styles.iconWrapper}>
            <FontAwesome5 name="dumbbell" size={16} color="white" />
          </View>
          <View>
            <Text style={styles.logoTitle}>LogLift</Text>
            <Text style={styles.logoSubtitle}>Your digital workout notebook</Text>
          </View>
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/(app)/profile')}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AppLayout() {
  const { exercisesWithRecentPRs } = useWorkouts();
  const insets = useSafeAreaInsets();
  const androidExtra = Platform.OS === 'android' ? 15 : 0;
  const bottomPadding = (insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 28 : 16)) + androidExtra;
  const tabHeight = 50 + bottomPadding;
  const [isChatVisible, setIsChatVisible] = useState(false);
  
  const segments = useSegments();
  // Hide FAB if we are in the active-workout route
  const isFABVisible = !segments.includes('active-workout');

  return (
    <View style={{ flex: 1 }}>
      <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor: '#030213',
        tabBarInactiveTintColor: '#717182',
        tabBarStyle: {
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 10,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.1)',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="grid" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: 'Templates',
          tabBarIcon: ({ color, size }) => <Feather name="copy" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => <Feather name="trending-up" size={20} color={color} />,
          tabBarBadge: exercisesWithRecentPRs.length > 0 ? "" : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#ef4444',
            minWidth: 8,
            height: 8,
            borderRadius: 4,
            marginTop: 4,
          }
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="active-workout/[workoutId]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
    
    <ChatFAB 
      onPress={() => setIsChatVisible(true)} 
      visible={isFABVisible} 
    />
    
    <ChatBot 
      isVisible={isChatVisible} 
      onClose={() => setIsChatVisible(false)} 
    />
  </View>
);
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    backgroundColor: '#030213',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#0a0a0a',
    lineHeight: 20,
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#717182',
    lineHeight: 16,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#030213',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  }
});
