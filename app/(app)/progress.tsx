import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';

// ─── Native Date Helpers (replacing date-fns) ───────────────
const parseISO = (dateStr: string) => new Date(dateStr);
const formatShort = (d: Date) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};
const formatLong = (d: Date) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
// ─────────────────────────────────────────────────────────────

export default function ProgressPage() {
  // Stub missing workout context data
  const completedSessions: any[] = [
    // Pre-populating a few dummy rows so you can see the native layout!
    {
      id: "1", date: new Date(Date.now() - 86400000 * 5).toISOString(), workoutName: "Chest & Back",
      exercises: [
        { name: "Bench Press", sets: [{ completed: true, weight: "75", actualReps: 10 }] },
        { name: "Squat", sets: [{ completed: true, weight: "100", actualReps: 5 }] }
      ]
    },
    {
      id: "2", date: new Date().toISOString(), workoutName: "Upper Body Power",
      exercises: [
        { name: "Bench Press", sets: [{ completed: true, weight: "80", actualReps: 8 }, { completed: true, weight: "85", actualReps: 6 }] },
        { name: "Squat", sets: [{ completed: true, weight: "115", actualReps: 5 }] }
      ]
    }
  ];

  // Collect all unique exercise names
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    completedSessions.forEach(s => s.exercises.forEach((e: any) => names.add(e.name)));
    return Array.from(names).sort();
  }, [completedSessions]);

  const [selectedExercise, setSelectedExercise] = useState<string>(exerciseNames[0] || "");

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    const byDate: Record<string, any> = {};

    completedSessions.forEach(session => {
      const exercise = session.exercises.find((e: any) => e.name === selectedExercise);
      if (!exercise) return;

      const completedSets = exercise.sets.filter((s: any) => s.completed);
      if (completedSets.length === 0) return;

      const maxW = Math.max(...completedSets.map((s: any) => Number(s.weight) || 0));
      const totalReps = completedSets.reduce((sum: number, s: any) => sum + s.actualReps, 0);

      if (!byDate[session.date] || maxW > byDate[session.date].maxWeight) {
        byDate[session.date] = {
          maxWeight: maxW,
          totalReps,
          sets: completedSets.length,
          sessionName: session.workoutName,
        };
      }
    });

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data], index) => ({
        id: `${date}-${index}`,
        date: formatShort(parseISO(date)),
        fullDate: date,
        weight: parseFloat(data.maxWeight.toFixed(1)),
        reps: data.totalReps,
        sets: data.sets,
        label: data.sessionName,
      }));
  }, [completedSessions, selectedExercise]);

  const prValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.weight)) : 0;
  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].weight : 0;
  const isPR = latestValue > 0 && latestValue === prValue && chartData.length > 1;

  const sessionHistory = useMemo(() => {
    if (!selectedExercise) return [];
    return completedSessions
      .filter(s => s.exercises.some((e: any) => e.name === selectedExercise))
      .slice(0, 10)
      .map(session => {
        const exercise = session.exercises.find((e: any) => e.name === selectedExercise)!;
        const completedSets = exercise.sets.filter((s: any) => s.completed);
        const maxW = completedSets.length > 0
          ? Math.max(...completedSets.map((s: any) => Number(s.weight) || 0))
          : 0;
        return {
          id: session.id,
          date: session.date,
          workoutName: session.workoutName,
          sets: completedSets.length,
          maxWeight: maxW,
          totalReps: completedSets.reduce((sum: number, s: any) => sum + s.actualReps, 0),
        };
      })
      .reverse();
  }, [completedSessions, selectedExercise]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress Tracker</Text>
      </View>

      {exerciseNames.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Feather name="trending-up" size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete your first workout using Active Workout Mode to start tracking progress.
          </Text>
        </View>
      ) : (
        <View style={styles.contentWrap}>
          
          {/* Exercise Selector (Horizontal Chips replacing the Web Dropdown) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
            {exerciseNames.map((name, i) => (
              <TouchableOpacity 
                key={`exercise-${i}-${name}`} 
                style={[styles.chip, selectedExercise === name && styles.chipActive]}
                onPress={() => setSelectedExercise(name)}
              >
                <Text style={[styles.chipText, selectedExercise === name && styles.chipTextActive]}>{name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* PR Bar */}
          <View style={styles.prHeader}>
            {isPR && (
              <View style={styles.prBadge}>
                <FontAwesome5 name="trophy" size={10} color="#ffffff" style={{marginRight: 4}} />
                <Text style={styles.prBadgeText}>New PR!</Text>
              </View>
            )}
            {prValue > 0 && (
              <Text style={styles.bestText}>
                Personal best: <Text style={styles.bestValue}>{prValue} kg</Text>
              </Text>
            )}
          </View>

          {/* Pure React Native Flexbox Bar Chart 
              Since Recharts (Web DOM SVG) crashes React Native, this beautifully mimics the visual using flex! */}
          {chartData.length > 0 ? (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Max weight per session (kg)</Text>
              <View style={styles.barChartContainer}>
                {chartData.map((d) => {
                  // Normalize height percentage
                  const heightPercent = prValue > 0 ? (d.weight / prValue) * 100 : 0;
                  const isPrBar = d.weight === prValue;
                  return (
                     <View key={d.id} style={styles.barColumn}>
                       <Text style={styles.barValue} adjustsFontSizeToFit numberOfLines={1}>{d.weight}</Text>
                       <View style={[
                         styles.bar, 
                         { height: `${heightPercent}%`, backgroundColor: isPrBar ? '#f59e0b' : '#2563eb' }
                       ]} />
                       <Text style={styles.barLabel} adjustsFontSizeToFit numberOfLines={1}>{d.date}</Text>
                     </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.noChartData}>
              <Text style={styles.noChartText}>No weight data for this exercise yet.</Text>
            </View>
          )}

          {/* Session History */}
          {sessionHistory.length > 0 && (
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Feather name="calendar" size={16} color="#0a0a0a" style={{marginRight: 8}} />
                <Text style={styles.historyHeaderTitle}>Session History</Text>
              </View>
              <View>
                {sessionHistory.map((s, index) => (
                  <View 
                    key={s.id} 
                    style={[
                      styles.historyRow, 
                      index === sessionHistory.length - 1 && { borderBottomWidth: 0 }
                    ]}
                  >
                    <View style={styles.historyRowLeft}>
                      <Text style={styles.historyWorkoutName}>{s.workoutName}</Text>
                      <Text style={styles.historyDate}>{formatLong(parseISO(s.date))}</Text>
                    </View>
                    <View style={styles.historyRowRight}>
                      {s.maxWeight > 0 && (
                        <Text style={styles.historyMaxWeight}>{s.maxWeight} kg</Text>
                      )}
                      <Text style={styles.historySetsReps}>{s.sets} sets · {s.totalReps} reps</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40, alignSelf: 'center', width: '100%', maxWidth: 672 },
  header: { marginBottom: 24, marginTop: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0a0a0a' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIconContainer: { backgroundColor: '#f3f4f6', padding: 24, borderRadius: 50, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#0a0a0a', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#717182', textAlign: 'center', maxWidth: 300, lineHeight: 20 },
  contentWrap: { gap: 16 },
  chipsContainer: { flexDirection: 'row', marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8 },
  chipActive: { backgroundColor: '#030213', borderColor: '#030213' },
  chipText: { fontSize: 14, color: '#717182', fontWeight: '500' },
  chipTextActive: { color: '#ffffff' },
  prHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  prBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eab308', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  prBadgeText: { fontSize: 12, color: '#ffffff', fontWeight: '600' },
  bestText: { fontSize: 14, color: '#717182' },
  bestValue: { fontWeight: '600', color: '#0a0a0a' },
  chartCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, paddingTop: 20 },
  chartTitle: { fontSize: 14, color: '#717182', marginBottom: 24 },
  barChartContainer: { height: 180, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  barColumn: { alignItems: 'center', width: '15%', height: '100%', justifyContent: 'flex-end' },
  barValue: { fontSize: 10, color: '#0a0a0a', fontWeight: '600', marginBottom: 4 },
  bar: { width: '100%', maxWidth: 32, borderRadius: 4, minHeight: 4, flexShrink: 0 },
  barLabel: { fontSize: 10, color: '#717182', marginTop: 8 },
  noChartData: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 32, alignItems: 'center' },
  noChartText: { color: '#717182', fontSize: 14 },
  historyCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden' },
  historyHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  historyHeaderTitle: { fontSize: 14, fontWeight: '600', color: '#0a0a0a' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  historyRowLeft: { flex: 1 },
  historyWorkoutName: { fontSize: 14, fontWeight: '500', color: '#0a0a0a', marginBottom: 2 },
  historyDate: { fontSize: 12, color: '#717182' },
  historyRowRight: { alignItems: 'flex-end' },
  historyMaxWeight: { fontSize: 14, fontWeight: '600', color: '#0a0a0a', marginBottom: 2 },
  historySetsReps: { fontSize: 12, color: '#717182' }
});
