import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ActiveExercise, CompletedSession, useWorkouts } from '../../../contexts/WorkoutContext';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const DEFAULT_REST = 60;

export default function ActiveWorkoutPage() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const { workouts, addCompletedSession } = useWorkouts();
  const router = useRouter();

  const workout = workouts.find(w => w.id === workoutId);

  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>(() => {
    if (!workout) return [];
    return workout.exercises.map(e => ({
      id: e.id,
      name: e.name,
      category: e.category,
      sets: Array.from({ length: e.sets }, (_, i) => ({
        setNumber: i + 1,
        plannedReps: e.reps,
        actualReps: e.reps,
        weight: e.weight || "",
        completed: false,
      })),
    }));
  });

  const startTimeRef = useRef<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restSeconds, setRestSeconds] = useState(DEFAULT_REST);
  const [restActive, setRestActive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rest timer
  useEffect(() => {
    if (!restActive) return;
    if (restSeconds <= 0) {
      setRestActive(false);
      setRestSeconds(DEFAULT_REST);
      Alert.alert("Rest Complete", "Time to go! 💪");
      return;
    }
    const t = setTimeout(() => setRestSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restActive, restSeconds]);


  const handleToggleSet = useCallback((exIdx: number, setIdx: number) => {
    let wasCompleted = false;
    setActiveExercises(prev => {
      const updated = prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, j) => {
            if (j !== setIdx) return s;
            wasCompleted = s.completed;
            return { ...s, completed: !s.completed };
          }),
        };
      });
      return updated;
    });

    // Start rest if completing a set
    if (!wasCompleted) {
      setRestSeconds(DEFAULT_REST);
      setRestActive(true);
    }
  }, []);

  const completedSetsCount = activeExercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0
  );
  const totalSetsCount = activeExercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const handleEndWorkout = () => {
    setRestActive(false);
    setShowSummary(true);
  };

  const handleSaveSession = async () => {
    if (!workout) return;
    const session: Omit<CompletedSession, "id"> = {
      workoutId: workout.id,
      workoutName: workout.name,
      date: workout.date,
      completedAt: new Date().toISOString(),
      durationMinutes: Math.max(1, Math.ceil(elapsedTime / 60)),
      exercises: activeExercises.map(ae => ({
        id: ae.id,
        name: ae.name,
        category: ae.category,
        sets: ae.sets,
      })),
    };
    await addCompletedSession(session);
    setShowSummary(false);
    router.replace('/(app)');
    Alert.alert("Workout Complete", `🏆 Session saved! Duration: ${formatTime(elapsedTime)}`);
  };

  if (!workout) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Workout not found.</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const allDone = completedSetsCount === totalSetsCount && totalSetsCount > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              "Leave Workout?",
              "Progress will be lost.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Leave", style: "destructive", onPress: () => router.back() }
              ]
            );
          }}
        >
          <Feather name="arrow-left" size={24} color="#0a0a0a" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{workout.name}</Text>
          <View style={styles.headerSub}>
            <Feather name="clock" size={12} color="#717182" style={{ marginRight: 4 }} />
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.headerDots}> · </Text>
            <Text style={styles.setCountText}>{completedSetsCount}/{totalSetsCount} sets</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.finishButton, allDone && styles.finishButtonDone]}
          onPress={handleEndWorkout}
        >
          <Feather name={allDone ? "award" : "square"} size={16} color={allDone ? "#ffffff" : "#0a0a0a"} style={{ marginRight: 6 }} />
          <Text style={[styles.finishButtonText, allDone && styles.finishButtonTextDone]}>
            {allDone ? "Finish" : "End"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: totalSetsCount > 0 ? `${(completedSetsCount / totalSetsCount) * 100}%` : '0%' }
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeExercises.map((exercise, exIdx) => {
          const exCompleted = exercise.sets.every(s => s.completed);
          return (
            <View
              key={exercise.id}
              style={[styles.exerciseCard, exCompleted && styles.exerciseCardDone]}
            >
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseTitleContainer}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  {exercise.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{exercise.category}</Text>
                    </View>
                  )}
                </View>
                {exCompleted && (
                  <View style={styles.doneCircle}>
                    <Feather name="check" size={12} color="#ffffff" />
                  </View>
                )}
              </View>

              {/* Set Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableLabel, { width: 30 }]}>Set</Text>
                <Text style={[styles.tableLabel, { flex: 1, textAlign: 'center' }]}>Reps</Text>
                <Text style={[styles.tableLabel, { flex: 1.5, textAlign: 'center' }]}>Weight</Text>
                <Text style={[styles.tableLabel, { width: 40, textAlign: 'right' }]}>Done</Text>
              </View>

              {/* Sets */}
              {exercise.sets.map((set, setIdx) => (
                <View
                  key={setIdx}
                  style={[styles.setRow, set.completed && styles.setRowDone]}
                >
                  <Text style={styles.setNumber}>{set.setNumber}</Text>

                  <View style={styles.valueWrapper}>
                    <Text style={styles.valueText}>{set.actualReps}</Text>
                    <Feather name="lock" size={8} color="#9ca3af" style={styles.lockIcon} />
                  </View>

                  <View style={styles.valueWrapper}>
                    <Text style={styles.valueText}>{set.weight || '0'} <Text style={styles.unitText}>kg</Text></Text>
                    <Feather name="lock" size={8} color="#9ca3af" style={styles.lockIcon} />
                  </View>

                  <TouchableOpacity
                    style={[styles.checkButton, set.completed && styles.checkButtonDone]}
                    onPress={() => handleToggleSet(exIdx, setIdx)}
                  >
                    <Feather name={set.completed ? "check" : "circle"} size={16} color={set.completed ? "#ffffff" : "#d1d5db"} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Rest Timer Banner */}
      {restActive && (
        <View style={styles.restBanner}>
          <Feather name="clock" size={18} color="#ffffff" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.restLabel}>Resting...</Text>
            <View style={styles.restProgressBg}>
              <View
                style={[
                  styles.restProgressFill,
                  { width: `${(restSeconds / DEFAULT_REST) * 100}%` }
                ]}
              />
            </View>
          </View>
          <Text style={styles.restTime}>{formatTime(restSeconds)}</Text>
          <TouchableOpacity style={styles.skipButton} onPress={() => setRestActive(false)}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Summary Modal */}
      <Modal visible={showSummary} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <FontAwesome5 name="trophy" size={24} color="#f59e0b" style={{ marginRight: 12 }} />
              <Text style={styles.modalTitle}>Workout Complete!</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{completedSetsCount}</Text>
                <Text style={styles.statLabel}>Sets Done</Text>
              </View>
            </View>

            <Text style={styles.modalSub}>Great job! Here's a quick recap:</Text>
            <ScrollView style={styles.summaryList} showsVerticalScrollIndicator={false}>
              {activeExercises.map(ex => {
                const done = ex.sets.filter(s => s.completed).length;
                return (
                  <View key={ex.id} style={styles.summaryRow}>
                    <Text style={styles.summaryExName} numberOfLines={1}>{ex.name}</Text>
                    <Text style={styles.summaryExSets}>
                      {done}/{ex.sets.length} sets {done === ex.sets.length ? '✓' : ''}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.keepGoingButton}
                onPress={() => setShowSummary(false)}
              >
                <Text style={styles.keepGoingText}>Keep Going</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveSession}
              >
                <Text style={styles.saveButtonText}>Save & Finish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#717182', marginBottom: 16 },
  errorButton: { backgroundColor: '#030213', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  errorButtonText: { color: '#ffffff', fontWeight: '600' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff'
  },
  backButton: { padding: 4 },
  headerTitleContainer: { flex: 1, paddingHorizontal: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0a0a0a' },
  headerSub: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  timerText: { fontSize: 12, color: '#717182', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  headerDots: { color: '#e5e7eb' },
  setCountText: { fontSize: 12, color: '#717182' },

  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  finishButtonDone: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  finishButtonText: { fontSize: 13, fontWeight: '600', color: '#0a0a0a' },
  finishButtonTextDone: { color: '#ffffff' },

  progressBarBg: { height: 4, backgroundColor: '#f3f4f6' },
  progressBarFill: { height: 4, backgroundColor: '#10b981' },

  scrollContent: { padding: 16, paddingBottom: 100 },

  exerciseCard: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16, overflow: 'hidden' },
  exerciseCardDone: { borderColor: '#d1fae5', backgroundColor: '#f0fdf4' },

  exerciseHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#f9fafb' },
  exerciseTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  exerciseName: { fontSize: 15, fontWeight: '600', color: '#0a0a0a', marginRight: 8 },
  categoryBadge: { backgroundColor: '#e5e7eb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  categoryBadgeText: { fontSize: 10, color: '#4b5563', fontWeight: '500' },
  doneCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },

  tableHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tableLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '500', textTransform: 'uppercase' },

  setRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  setRowDone: { backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  setNumber: { width: 30, fontSize: 14, color: '#717182', fontWeight: '500' },
  valueWrapper: { 
    flex: 1, 
    marginHorizontal: 4, 
    backgroundColor: '#f3f4f6', 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 6, 
    height: 36, 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative'
  },
  lockIcon: { position: 'absolute', top: 4, right: 4 },
  valueText: { fontSize: 16, fontWeight: '600', color: '#4b5563' },
  unitText: { fontSize: 12, color: '#9ca3af', fontWeight: '400' },
  checkButton: { width: 40, height: 40, alignItems: 'flex-end', justifyContent: 'center' },
  checkButtonDone: { /* color changes via icon props */ },

  restBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#030213',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  restLabel: { color: '#ffffff', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  restProgressBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
  restProgressFill: { height: 3, backgroundColor: '#ffffff', borderRadius: 2 },
  restTime: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginHorizontal: 16, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  skipButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)' },
  skipButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0a0a0a' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#0a0a0a' },
  statLabel: { fontSize: 11, color: '#717182', marginTop: 2 },
  modalSub: { fontSize: 14, color: '#717182', marginBottom: 12 },
  summaryList: { maxHeight: 200, marginBottom: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryExName: { fontSize: 14, color: '#4b5563', flex: 1 },
  summaryExSets: { fontSize: 14, fontWeight: '600', color: '#0a0a0a', marginLeft: 12 },
  modalFooter: { flexDirection: 'row', gap: 12 },
  keepGoingButton: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  keepGoingText: { color: '#0a0a0a', fontWeight: '600' },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#030213', alignItems: 'center' },
  saveButtonText: { color: '#ffffff', fontWeight: '600' }
});
