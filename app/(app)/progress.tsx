import { Feather, FontAwesome5 } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useWorkouts } from '../../contexts/WorkoutContext';
import { exerciseDatabase } from '../../data/exerciseDatabase';
import { getCategoryColor } from '../../lib/colors';

// ─── Native Date Helpers (replacing date-fns) ───────────────
const parseISO = (dateStr: string) => new Date(dateStr);
const formatShort = (d: Date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};
const formatLong = (d: Date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};
// ─────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const isFocused = useIsFocused();
  const { completedSessions, isLoading, exercisesWithRecentPRs, markPRAsSeen } = useWorkouts();
  const { weightUnit, convertToDisplay } = useSettings();
  const { user } = useAuth();

  // Collect all unique exercise names
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    completedSessions.forEach(s => s.exercises.forEach((e: any) => names.add(e.name)));
    return Array.from(names).sort();
  }, [completedSessions]);

  const [selectedExercise, setSelectedExercise] = useState<string>(exerciseNames[0] || "");
  const [activeBar, setActiveBar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExerciseNames = useMemo(() => {
    if (!searchQuery) return exerciseNames;
    return exerciseNames.filter(name =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [exerciseNames, searchQuery]);

  const selectedExerciseCategory = useMemo(() => {
    return exerciseDatabase.find(e => e.name === selectedExercise)?.category;
  }, [selectedExercise]);

  const categoryTheme = getCategoryColor(selectedExerciseCategory);

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    const byDate: Record<string, any> = {};

    completedSessions.forEach(session => {
      const exercise = session.exercises.find((e: any) => e.name === selectedExercise);
      if (!exercise) return;

      const completedSets = exercise.sets.filter((s: any) => s.completed);
      if (completedSets.length === 0) return;

      const maxW = Math.max(...completedSets.map((s: any) => Number(s.weight) || 0));
      const displayMaxW = convertToDisplay(maxW);
      const totalReps = completedSets.reduce((sum: number, s: any) => sum + s.actualReps, 0);

      if (!byDate[session.date] || displayMaxW > byDate[session.date].maxWeight) {
        byDate[session.date] = {
          maxWeight: displayMaxW,
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
        weight: data.maxWeight,
        reps: data.totalReps,
        sets: data.sets,
        label: data.sessionName,
      }));
  }, [completedSessions, selectedExercise, weightUnit, convertToDisplay]);

  const prValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.weight)) : 0;
  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].weight : 0;

  // Find all-time PB across all data
  const allTimePB = useMemo(() => {
    let max = 0;
    completedSessions.forEach(session => {
      const ex = session.exercises.find(e => e.name === selectedExercise);
      if (ex) {
        ex.sets.forEach(s => {
          if (s.completed) {
            const w = parseFloat(s.weight) || 0;
            const dw = convertToDisplay(w);
            if (dw > max) max = dw;
          }
        });
      }
    });
    return max;
  }, [completedSessions, selectedExercise, weightUnit, convertToDisplay]);

  const isPR = latestValue > 0 && latestValue >= allTimePB && chartData.length > 1;

  const sessionHistory = useMemo(() => {
    if (!selectedExercise) return [];
    return completedSessions
      .filter(s => s.exercises.some((e: any) => e.name === selectedExercise))
      .slice(0, 10)
      .map(session => {
        const exercise = session.exercises.find((e: any) => e.name === selectedExercise)!;
        const completedSets = exercise.sets.filter((s: any) => s.completed);
        const bestSet = [...completedSets].sort((a, b) => {
          const wA = Number(a.weight) || 0;
          const wB = Number(b.weight) || 0;
          if (wB !== wA) return wB - wA;
          return b.actualReps - a.actualReps;
        })[0];

        const maxW = bestSet ? (Number(bestSet.weight) || 0) : 0;
        const bestReps = bestSet ? bestSet.actualReps : 0;

        return {
          id: session.id,
          date: session.date,
          workoutName: session.workoutName,
          maxWeight: convertToDisplay(maxW),
          bestReps: bestReps,
        };
      })
      .reverse();
  }, [completedSessions, selectedExercise, weightUnit, convertToDisplay]);

  return (
    <ScrollView 
      key={isFocused ? 'focused' : 'not-focused'} 
      style={styles.container} 
      contentContainerStyle={styles.content}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500).springify()} style={styles.header}>
        <Text style={styles.headerTitle}>Progress Tracker</Text>
      </Animated.View>

      <View style={styles.contentWrap}>
        {/* Search and Exercise Selector */}
        <Animated.View entering={FadeInUp.delay(100).duration(500).springify()} style={styles.selectorWrapper}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={16} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x-circle" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {exerciseNames.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
              {filteredExerciseNames.length > 0 ? (
                filteredExerciseNames.map((name, i) => (
                  <TouchableOpacity
                    key={`exercise-${i}-${name}`}
                    style={[
                      styles.chip,
                      selectedExercise === name && styles.chipActive,
                      exercisesWithRecentPRs.includes(name) && styles.chipPR
                    ]}
                    onPress={() => {
                      setSelectedExercise(name);
                      markPRAsSeen(name);
                    }}
                  >
                    <View style={styles.chipContent}>
                      <Text style={[
                        styles.chipText,
                        selectedExercise === name && styles.chipTextActive,
                        exercisesWithRecentPRs.includes(name) && styles.chipTextPR
                      ]}>{name}</Text>
                      {exercisesWithRecentPRs.includes(name) && (
                        <FontAwesome5
                          name="trophy"
                          size={10}
                          color="#854d0e"
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResultsText}>No exercises found</Text>
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyStateInline}>
              <Feather name="trending-up" size={24} color="#9ca3af" style={{ marginRight: 12 }} />
              <Text style={styles.emptyTitleInline}>No data yet. Start a workout to track progress.</Text>
            </View>
          )}
        </Animated.View>

        {/* PR Bar (Hidden if no PR, but structure is there) */}
        <Animated.View entering={FadeInLeft.delay(200).duration(500).springify()} style={styles.prHeader}>
          {isPR && (
            <View style={styles.prBadge}>
              <FontAwesome5 name="trophy" size={10} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.prBadgeText}>{selectedExercise} PR!</Text>
            </View>
          )}
          {prValue > 0 && (
            <Text style={styles.bestText}>
              Personal best: <Text style={styles.bestValue}>{prValue} {weightUnit}</Text>
            </Text>
          )}
        </Animated.View>

        {/* Enhanced Flexbox Bar Chart Card (Always Persistent) */}
        <Animated.View entering={FadeInUp.delay(300).duration(600).springify()} style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>Max weight per session ({weightUnit})</Text>
            {activeBar && (
              <View style={styles.activeBarInfo}>
                <Text style={styles.activeBarText}>
                  {chartData.find(d => d.id === activeBar)?.weight}{weightUnit} · {chartData.find(d => d.id === activeBar)?.date}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.chartContainerOuter}>
            {/* Y-Axis scale */}
            <View style={styles.yAxis}>
              <Text style={styles.yAxisText}>{allTimePB > 0 ? allTimePB : '--'}{weightUnit}</Text>
              <View style={styles.yAxisLine} />
              <Text style={styles.yAxisText}>{allTimePB > 0 ? Math.round(allTimePB / 2) : '--'}{weightUnit}</Text>
              <View style={styles.yAxisLine} />
              <Text style={styles.yAxisText}>0</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.barChartScrollContent}
              scrollEnabled={chartData.length > 0}
            >
              <View style={[styles.barChartContainer, chartData.length === 0 && styles.barChartContainerEmpty]}>
                {chartData.length > 0 ? (
                  <>
                    {/* PB Line */}
                    <View style={[styles.pbIndicatorLine, { bottom: 24 + 156 - 1 }]} />

                    {chartData.map((d) => {
                      const heightPercent = allTimePB > 0 ? (d.weight / allTimePB) * 100 : 0;
                      const isPrBar = d.weight === allTimePB;
                      const isActive = activeBar === d.id;

                      return (
                        <Pressable
                          key={d.id}
                          style={styles.barColumn}
                          onPressIn={() => setActiveBar(d.id)}
                          onPressOut={() => setActiveBar(null)}
                        >
                          <View style={styles.barWrapper}>
                            <View style={[
                              styles.bar,
                              {
                                height: `${heightPercent}%`,
                                backgroundColor: isPrBar ? '#eab308' : categoryTheme.bg,
                                opacity: activeBar && !isActive ? 0.4 : 1,
                                borderTopLeftRadius: 6,
                                borderTopRightRadius: 6,
                              }
                            ]} />
                          </View>
                          <View style={styles.barLabelContainer}>
                            <Text style={styles.barLabel} numberOfLines={1}>{d.date}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </>
                ) : (
                  <View style={styles.noChartDataPlaceholder}>
                    <Text style={styles.noChartTextPlaceholder}>No session data available</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>

          <View style={styles.chartFooter}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#eab308' }]} />
              <Text style={styles.legendText}>Personal Best</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: categoryTheme.bg || '#e5e7eb' }]} />
              <Text style={styles.legendText}>Session Max</Text>
            </View>
          </View>
        </Animated.View>

        {/* Session History */}
        {sessionHistory.length > 0 && (
          <Animated.View entering={FadeInUp.delay(500).duration(600).springify()} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Feather name="calendar" size={16} color="#0a0a0a" style={{ marginRight: 8 }} />
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
                      <View style={styles.maxWeightContainer}>
                        <Text style={styles.historyMaxWeight}>
                          {s.maxWeight} {weightUnit}
                        </Text>
                        {allTimePB > 0 && s.maxWeight === allTimePB && (
                          <FontAwesome5 name="trophy" size={10} color="#eab308" style={{ marginLeft: 4 }} />
                        )}
                      </View>
                    )}
                    <Text style={styles.historySetsReps}>{selectedExercise}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </View>
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
  chipPR: { backgroundColor: '#fde047', borderColor: '#facc15' },
  chipContent: { flexDirection: 'row', alignItems: 'center' },
  chipText: { fontSize: 14, color: '#717182', fontWeight: '500' },
  chipTextActive: { color: '#ffffff' },
  chipTextPR: { color: '#854d0e', fontWeight: '700' },
  prHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  prBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eab308', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  prBadgeText: { fontSize: 12, color: '#ffffff', fontWeight: '600' },
  bestText: { fontSize: 14, color: '#717182' },
  bestValue: { fontWeight: '600', color: '#0a0a0a' },
  chartCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, paddingTop: 20 },
  chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chartTitle: { fontSize: 14, color: '#717182' },
  activeBarInfo: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeBarText: { fontSize: 12, fontWeight: '600', color: '#030213' },
  chartContainerOuter: { flexDirection: 'row', height: 220 },
  yAxis: { width: 40, height: 180, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 8 },
  yAxisText: { fontSize: 10, color: '#9ca3af', fontWeight: '500' },
  yAxisLine: { height: 1, backgroundColor: '#f3f4f6', width: 4 },
  barChartScrollContent: { paddingRight: 16 },
  barChartContainer: { height: 180, flexDirection: 'row', alignItems: 'flex-end', position: 'relative', minWidth: '100%' },
  pbIndicatorLine: { position: 'absolute', left: 0, right: 0, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#eab308', zIndex: 1, opacity: 0.5 },
  barColumn: { alignItems: 'center', width: 60, height: 180, justifyContent: 'flex-end' },
  barWrapper: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 32, minHeight: 4, flexShrink: 0 },
  barLabelContainer: { height: 24, justifyContent: 'center', alignItems: 'center' },
  barLabel: { fontSize: 10, color: '#717182' },
  chartFooter: { flexDirection: 'row', gap: 16, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendColor: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 12, color: '#717182' },
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
  maxWeightContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  historySetsReps: { fontSize: 12, color: '#717182' },
  selectorWrapper: { marginBottom: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, height: 40, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#0a0a0a', paddingVertical: 8 },
  noResultsText: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginLeft: 8, marginTop: 8 },
  emptyStateInline: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fef08a', padding: 12, borderRadius: 10, marginBottom: 8 },
  emptyTitleInline: { fontSize: 13, color: '#854d0e', fontWeight: '500', flex: 1 },
  barChartContainerEmpty: { justifyContent: 'center', alignItems: 'center' },
  noChartDataPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', minWidth: 200 },
  noChartTextPlaceholder: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }
});
