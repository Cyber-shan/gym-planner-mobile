import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { isSameWeek, startOfWeek, subWeeks, parseISO, isSameDay, subDays, startOfDay } from 'date-fns';
import { useSettings } from '../contexts/SettingsContext';

export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: any[];
}
export interface CompletedSession {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  completedAt: string;
  durationMinutes: number;
  exercises: {
    id: string;
    name: string;
    category?: string;
    sets: {
      weight: string;
      actualReps: number;
      completed: boolean;
    }[];
  }[];
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
  const { weightUnit, convertToDisplay } = useSettings();
  const stats = useMemo(() => {
    const now = new Date();
    
    // Helper to parse date strings safely in local time
    const parseLocalOrISO = (dateStr: string) => {
      if (!dateStr) return new Date(0);
      if (dateStr.includes('T')) return parseISO(dateStr);
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    };

    // 1. Workouts This Week
    const sessionsThisWeek = sessions.filter(s => 
      isSameWeek(parseLocalOrISO(s.completedAt), now, { weekStartsOn: 1 })
    );
    const workoutsThisWeek = sessionsThisWeek.length;
    
    // Total planned for this week
    const plannedThisWeek = workouts.filter(w => {
      const wDate = parseLocalOrISO(w.date);
      return isSameWeek(wDate, now, { weekStartsOn: 1 });
    }).length;

    // 2. Weekly Volume
    let totalVolume = 0;
    sessionsThisWeek.forEach(s => {
      s.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.completed) {
            totalVolume += (parseFloat(set.weight) || 0) * (set.actualReps || 0);
          }
        });
      });
    });

    const formatVolume = (v: number) => {
      const displayVolume = convertToDisplay(v);
      if (displayVolume >= 1000) {
        return `${(displayVolume / 1000).toFixed(1)} ${weightUnit === 'kg' ? 't' : 'klb'}`;
      }
      return `${Math.round(displayVolume)} ${weightUnit}`;
    };

    // 3. Streak (Daily based, converts to weeks at 7)
    const sessionDates = new Set(sessions.map(s => {
      const d = parseLocalOrISO(s.completedAt);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }));

    let streakDays = 0;
    let curr = startOfDay(now);
    
    // Check if streak is alive (session today or yesterday)
    const hasToday = sessionDates.has(`${curr.getFullYear()}-${curr.getMonth() + 1}-${curr.getDate()}`);
    const yesterday = subDays(curr, 1);
    const hasYesterday = sessionDates.has(`${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`);

    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? curr : yesterday;
      while (true) {
        const dateKey = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
        if (sessionDates.has(dateKey)) {
          streakDays++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
    }

    const formatStreak = (days: number) => {
      if (days === 0) return "0";
      if (days === 1) return "1 day";
      if (days >= 7) {
        const wks = Math.floor(days / 7);
        const rem = days % 7;
        if (rem === 0) return `${wks} wks`;
        return `${wks} wks ${rem} d`;
      }
      return `${days} days`;
    };

    // 4. Top Muscle
    const categoryCounts: Record<string, number> = {};
    sessionsThisWeek.forEach(s => {
      s.exercises.forEach(ex => {
        if (ex.category) {
          categoryCounts[ex.category] = (categoryCounts[ex.category] || 0) + ex.sets.filter(st => st.completed).length;
        }
      });
    });

    let topMuscle = "None";
    let maxSets = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxSets) {
        maxSets = count;
        topMuscle = cat;
      }
    });

    return {
      workoutsThisWeek: `${plannedThisWeek}`,
      volume: formatVolume(totalVolume),
      streak: formatStreak(streakDays),
      topMuscle: topMuscle.length > 8 ? topMuscle.substring(0, 8) + '...' : topMuscle,
    };
  }, [workouts, sessions, weightUnit, convertToDisplay]);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(0).duration(500).springify()} style={{ width: cardWidth }}>
        <StatCard
          icon={<FontAwesome5 name="dumbbell" size={14} color="#2563eb" />}
          label="This Week"
          value={`${stats.workoutsThisWeek}`}
          sub="planned"
          colorBg="#eff6ff"
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={{ width: cardWidth }}>
        <StatCard
          icon={<Feather name="trending-up" size={14} color="#16a34a" />}
          label="Weekly Vol."
          value={stats.volume}
          sub="lifted"
          colorBg="#f0fdf4"
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={{ width: cardWidth }}>
        <StatCard
          icon={<FontAwesome5 name="fire" size={14} color="#f97316" />}
          label="Streak"
          value={stats.streak}
          sub="consecutive"
          colorBg="#fff7ed"
        />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(300).duration(500).springify()} style={{ width: cardWidth }}>
        <StatCard
          icon={<FontAwesome5 name="bullseye" size={14} color="#9333ea" />}
          label="Top Muscle"
          value={stats.topMuscle}
          sub="this week"
          colorBg="#faf5ff"
        />
      </Animated.View>
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
    width: '100%', // StatCard takes full width of Animated.View
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
