import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

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

interface WeeklyCalendarProps {
  workouts: Workout[];
  sessions: CompletedSession[];
}

// ─── Helper functions to replace `date-fns` completely! ─────────────
const formatDate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const isToday = (d: Date) => {
  const t = new Date();
  return d.getDate() === t.getDate() && 
         d.getMonth() === t.getMonth() && 
         d.getFullYear() === t.getFullYear();
};
// ────────────────────────────────────────────────────────────────────

export function WeeklyCalendar({ workouts = [], sessions = [] }: WeeklyCalendarProps) {
  const days = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    
    // Adjust to make Monday the start of the week:
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const weekStart = new Date(today.getFullYear(), today.getMonth(), diffToMonday);
    weekStart.setHours(0,0,0,0);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>THIS WEEK</Text>
      
      <View style={styles.grid}>
        {days.map((day, i) => {
          const dateStr = formatDate(day);
          
          const hasWorkout = workouts.some(w => w.date === dateStr);
          const hasSession = sessions.some(s => s.date && s.date.startsWith(dateStr));
          const todayFlag = isToday(day);

          return (
            <View 
              key={dateStr} 
              style={[
                styles.dayContainer, 
                todayFlag && styles.dayContainerToday
              ]}
            >
              <Text style={[styles.dayLabel, todayFlag && styles.textToday]}>
                {dayLabels[i]}
              </Text>
              
              <Text style={[styles.dayDate, todayFlag && styles.textToday]}>
                {day.getDate()}
              </Text>

              {/* Dots Container */}
              <View style={styles.dotsContainer}>
                {hasSession ? (
                  <View style={[styles.dotCompleted, todayFlag && styles.dotCompletedToday]} />
                ) : hasWorkout ? (
                  <View style={[styles.dotPlanned, todayFlag && styles.dotPlannedToday]} />
                ) : (
                  <View style={styles.dotEmpty} /> // spacer
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend Area */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={styles.dotCompleted} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.dotPlanned} />
          <Text style={styles.legendText}>Planned</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 12,
    color: '#717182',
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '13%', // Keeps seven columns spaced out roughly equally
    borderRadius: 8,
  },
  dayContainerToday: {
    backgroundColor: '#030213', // Black primary color
  },
  dayLabel: {
    fontSize: 12,
    color: '#717182',
    fontWeight: '500',
    marginBottom: 4,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0a0a',
    marginBottom: 6,
  },
  textToday: {
    color: '#ffffff',
  },
  dotsContainer: {
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCompleted: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e', 
  },
  dotCompletedToday: {
    backgroundColor: '#ffffff',
  },
  dotPlanned: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#60a5fa', 
  },
  dotPlannedToday: {
    borderColor: '#ffffff',
  },
  dotEmpty: {
    width: 6,
    height: 6,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#717182',
    fontWeight: '500',
  }
});
