import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';

export interface Workout {
  id: string;
  date: string;
  exercises: any[];
}
export interface CompletedSession {
  id: string;
  date: string;
  exercises: any[];
}

interface StatsStripProps {
  workouts: Workout[];
  sessions: CompletedSession[];
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  colorBg: string;
}

const { width } = Dimensions.get('window');
// Calculate exactly 48% to leave 4% for inner spacing between the two columns
const cardWidth = '48%';

function StatCard({ icon, label, value, sub, colorBg }: StatCardProps) {
  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <View style={[styles.iconContainer, { backgroundColor: colorBg }]}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
        {sub ? <Text style={styles.sub} numberOfLines={1}>{sub}</Text> : null}
      </View>
    </View>
  );
}

export function StatsStrip({ workouts = [], sessions = [] }: StatsStripProps) {
  const stats = useMemo(() => {
    return {
      workoutsThisWeek: 3,
      volume: "12.5t",
      streak: 4,
      topMuscle: "Chest",
    };
  }, [workouts, sessions]);

  return (
    <View style={styles.container}>
      <StatCard
        icon={<FontAwesome5 name="dumbbell" size={14} color="#2563eb" />}
        label="This Week"
        value={`${stats.workoutsThisWeek}`}
        sub="planned"
        colorBg="#eff6ff"
      />
      <StatCard
        icon={<Feather name="trending-up" size={14} color="#16a34a" />}
        label="Weekly Vol."
        value={stats.volume}
        sub="lifted"
        colorBg="#f0fdf4"
      />
      <StatCard
        icon={<FontAwesome5 name="fire" size={14} color="#f97316" />}
        label="Streak"
        value={`${stats.streak} wks`}
        sub="consecutive"
        colorBg="#fff7ed"
      />
      <StatCard
        icon={<FontAwesome5 name="bullseye" size={14} color="#9333ea" />}
        label="Top Muscle"
        value={stats.topMuscle}
        sub="this week"
        colorBg="#faf5ff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: '#717182',
    fontWeight: '500',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a0a0a',
    marginVertical: 1,
  },
  sub: {
    fontSize: 11,
    color: '#717182',
  }
});
