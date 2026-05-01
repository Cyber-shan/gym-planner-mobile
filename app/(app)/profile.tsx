import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';

import { useSettings } from '../../contexts/SettingsContext';
import { useWorkouts } from '../../contexts/WorkoutContext';

export default function ProfilePage() {
  const isFocused = useIsFocused();
  const { user, logout } = useAuth();
  const { workouts, completedSessions, totalPRsCount, clearAllWorkouts } = useWorkouts();
  const { weightUnit, weekStartsOn, updateWeightUnit, updateWeekStartsOn } = useSettings();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.name || "");
  const [notifications, setNotifications] = useState(true);
  const [restReminders, setRestReminders] = useState(true);

  useEffect(() => { setDisplayName(user?.name || ""); }, [user?.name]);

  const handleSave = () => {
    Alert.alert("Success", "Settings saved!");
  };

  const handleClearWorkouts = () => {
    Alert.alert(
      "Clear Workouts",
      "This will permanently delete all your workouts. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            clearAllWorkouts();
            Alert.alert("Cleared", "All workouts cleared.");
          }
        }
      ]
    );
  };

  const totalSessions = completedSessions.length;
  const totalWorkouts = workouts.length;
  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : (user?.email?.[0] || "U").toUpperCase();

  return (
    <ScrollView
      key={isFocused ? 'focused' : 'not-focused'}
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      {/* ── Profile Hero ── */}
      <Animated.View entering={FadeInDown.delay(0).duration(500).springify()} style={styles.heroSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.nameText}>{displayName || "Your Name"}</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Free Plan</Text>
        </View>
      </Animated.View>

      {/* ── Quick Stats ── */}
      <Animated.View entering={FadeInUp.delay(100).duration(500).springify()} style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBadge, { backgroundColor: '#eff6ff' }]}>
            <FontAwesome5 name="dumbbell" size={14} color="#2563eb" />
          </View>
          <Text style={styles.statValue}>{totalWorkouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBadge, { backgroundColor: '#f0fdf4' }]}>
            <Feather name="bar-chart-2" size={14} color="#16a34a" />
          </View>
          <Text style={styles.statValue}>{totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBadge, { backgroundColor: '#fefce8' }]}>
            <FontAwesome5 name="trophy" size={14} color="#ca8a04" />
          </View>
          <Text style={styles.statValue}>{totalPRsCount}</Text>
          <Text style={styles.statLabel}>PRs Set</Text>
        </View>
      </Animated.View>

      {/* ── Account ── */}
      <Animated.View entering={FadeInLeft.delay(200).duration(500).springify()} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="user" size={16} color="#717182" />
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        <View style={styles.sectionBody}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
            />
          </View>
          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.emailInputWrapper}>
              <Feather name="mail" size={16} color="#717182" style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.input, styles.inputDisabled, { flex: 1, paddingHorizontal: 0, height: '100%' }]}
                value={user?.email || ""}
                editable={false}
              />
            </View>
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Workout Preferences ── */}
      <Animated.View entering={FadeInRight.delay(300).duration(500).springify()} style={styles.section}>
        <View style={styles.sectionHeader}>
          <FontAwesome5 name="dumbbell" size={14} color="#717182" />
          <Text style={styles.sectionTitle}>Workout Preferences</Text>
        </View>
        <View style={styles.sectionBodyNoPadding}>
          {/* Replaced 'Select' with a tap-to-toggle component since RN has no native Select box */}
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Week Starts On</Text>
            </View>
            <TouchableOpacity
              style={styles.pickerStub}
              onPress={() => updateWeekStartsOn(weekStartsOn === 'monday' ? 'sunday' : 'monday')}
            >
              <Text style={styles.pickerStubText}>{weekStartsOn}</Text>
              <Feather name="chevron-down" size={14} color="#717182" />
            </TouchableOpacity>
          </View>
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#f3f4f6' }]}>
            <View>
              <Text style={styles.rowTitle}>Weight Units</Text>
            </View>
            <TouchableOpacity
              style={styles.pickerStub}
              onPress={() => updateWeightUnit(weightUnit === 'kg' ? 'lb' : 'kg')}
            >
              <Text style={styles.pickerStubText}>{weightUnit}</Text>
              <Feather name="chevron-down" size={14} color="#717182" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* ── Notifications ── */}
      <Animated.View entering={FadeInLeft.delay(400).duration(500).springify()} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="bell" size={16} color="#717182" />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        <View style={styles.sectionBodyNoPadding}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Push Notifications</Text>
              <Text style={styles.rowSubtitle}>Receive reminders about workouts</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#f3f4f6' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Rest Timer Alerts</Text>
              <Text style={styles.rowSubtitle}>Alert when rest period is over</Text>
            </View>
            <Switch value={restReminders} onValueChange={setRestReminders} />
          </View>
        </View>
      </Animated.View>

      {/* ── Save Settings ── */}
      <Animated.View entering={FadeInUp.delay(500).duration(500).springify()}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Danger Zone ── */}
      <Animated.View entering={FadeInUp.delay(600).duration(500).springify()} style={[styles.section, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
        <View style={[styles.sectionHeader, { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderBottomColor: 'rgba(239, 68, 68, 0.2)' }]}>
          <Feather name="shield" size={16} color="#ef4444" />
          <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Danger Zone</Text>
        </View>
        <View style={styles.sectionBody}>
          <TouchableOpacity style={styles.dangerButtonOutline} onPress={handleClearWorkouts}>
            <Feather name="trash-2" size={16} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.dangerButtonOutlineText}>Clear All Workouts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerButtonSolid} onPress={() => {
            logout();
            router.replace('/(auth)/login');
          }}>
            <Feather name="log-out" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.dangerButtonSolidText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40, maxWidth: 672, width: '100%', alignSelf: 'center' },
  heroSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#030213', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
  nameText: { fontSize: 20, fontWeight: '700', color: '#0a0a0a', marginBottom: 4 },
  emailText: { fontSize: 14, color: '#717182', marginBottom: 12 },
  badge: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '500', color: '#374151' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  statIconBadge: { padding: 8, borderRadius: 8, marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#717182' },
  section: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 24, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#0a0a0a', marginLeft: 8 },
  sectionBody: { padding: 16 },
  sectionBodyNoPadding: { paddingVertical: 0 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#0a0a0a', marginBottom: 6 },
  input: { height: 40, backgroundColor: '#f3f4f6', borderRadius: 6, paddingHorizontal: 12, fontSize: 16, color: '#0a0a0a' },
  inputDisabled: { opacity: 0.5 },
  emailInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 6, height: 40, paddingHorizontal: 12 },
  helperText: { fontSize: 12, color: '#717182', marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  rowTitle: { fontSize: 14, fontWeight: '500', color: '#0a0a0a' },
  rowSubtitle: { fontSize: 12, color: '#717182', marginTop: 2 },
  pickerStub: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  pickerStubText: { fontSize: 14, color: '#0a0a0a', marginRight: 8, textTransform: 'capitalize' },
  saveButton: { backgroundColor: '#030213', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 24 },
  saveButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  dangerButtonOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', marginBottom: 12 },
  dangerButtonOutlineText: { color: '#ef4444', fontSize: 14, fontWeight: '500' },
  dangerButtonSolid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 6, backgroundColor: '#ef4444' },
  dangerButtonSolidText: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
});
