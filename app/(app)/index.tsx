import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatsStrip } from '../../components/StatsStrip';
import { WeeklyCalendar } from '../../components/WeeklyCalendar';
import { AddWorkoutDialog } from '../../components/AddWorkoutDialog';
import { WorkoutCard, Workout } from '../../components/WorkoutCard';

export default function DashboardPage() {
  const router = useRouter();
  
  // Dummy data mimicking the missing WorkoutContext
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [isWorkoutDialogOpen, setIsWorkoutDialogOpen] = useState(false);

  const handleAddWorkout = (name: string, date: string) => {
    setWorkouts([...workouts, { id: Math.random().toString(), date, name, exercises: [] }]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Stats Strip */}
      <StatsStrip workouts={workouts} sessions={completedSessions} />

      {/* Calendar */}
      <WeeklyCalendar workouts={workouts} sessions={completedSessions} />

      {/* Main Layout Area */}
      <View style={styles.mainArea}>
        
        {/* Workouts Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workouts</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setIsWorkoutDialogOpen(true)}>
            <Feather name="plus" size={16} color="white" style={styles.addIcon} />
            <Text style={styles.addButtonText}>New Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Empty State / List */}
        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <FontAwesome5 name="dumbbell" size={48} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptySubtitle}>
              Start building your training routine by creating your first workout plan
            </Text>
            <TouchableOpacity style={styles.createFirstButton} onPress={() => setIsWorkoutDialogOpen(true)}>
              <Feather name="plus" size={20} color="white" style={styles.addIcon} />
              <Text style={styles.createFirstButtonText}>Create Your First Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
             {workouts.map(w => (
                <WorkoutCard
                  key={w.id}
                  workout={w}
                  onDelete={id => setWorkouts(prev => prev.filter(wk => wk.id !== id))}
                  onAddExercise={id => {
                     // dummy add exercise logic
                     setWorkouts(prev => prev.map(wk => {
                        if (wk.id === id) {
                          return { ...wk, exercises: [...wk.exercises, { id: Math.random().toString(), name: "Lat Pulldown", sets: 3, reps: 10, category: "Back" }] };
                        }
                        return wk;
                     }));
                  }}
                  onDeleteExercise={(wId, eId) => {
                     setWorkouts(prev => prev.map(wk => {
                        if (wk.id === wId) return { ...wk, exercises: wk.exercises.filter(e => e.id !== eId) };
                        return wk;
                     }));
                  }}
                  onEditExercise={(wId, eId, updated) => {
                     setWorkouts(prev => prev.map(wk => {
                        if (wk.id === wId) {
                           return { ...wk, exercises: wk.exercises.map(e => e.id === eId ? { ...e, ...updated } : e) };
                        }
                        return wk;
                     }));
                  }}
                  onStartWorkout={(wId) => alert(`Starting workout ${wId}`)}
                  onSaveAsTemplate={(name, exercises) => alert(`Saved template ${name} with ${exercises.length} exercises!`)}
                />
             ))}
          </View>
        )}
      </View>

      <AddWorkoutDialog
        open={isWorkoutDialogOpen}
        onOpenChange={setIsWorkoutDialogOpen}
        onAdd={handleAddWorkout}
      />
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  mainArea: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#030213',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  addIcon: {
    marginRight: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 50,
    padding: 24,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0a0a0a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#717182',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
    lineHeight: 20,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#030213',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});
