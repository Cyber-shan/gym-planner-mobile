import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatsStrip } from '../../components/StatsStrip';
import { WeeklyCalendar } from '../../components/WeeklyCalendar';
import { AddWorkoutDialog } from '../../components/AddWorkoutDialog';
import { WorkoutCard } from '../../components/WorkoutCard';
import { useWorkouts } from '../../contexts/WorkoutContext';
import { useTemplates } from '../../contexts/TemplateContext';
import { ActivityIndicator, Alert } from 'react-native';

export default function DashboardPage() {
  const router = useRouter();
  
  const { 
    workouts, 
    isLoading, 
    addWorkout, 
    deleteWorkout, 
    addExercise, 
    deleteExercise, 
    updateExercise 
  } = useWorkouts();

  const { addTemplate } = useTemplates();

  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [isWorkoutDialogOpen, setIsWorkoutDialogOpen] = useState(false);

  const handleAddWorkout = async (name: string, date: string) => {
    try {
      await addWorkout(name, date);
    } catch (e: any) {
      Alert.alert("Error", "Failed to create workout: " + e.message);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#030213" />
      </View>
    );
  }

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
           
          </View>
        ) : (
          <View>
             {workouts.map(w => (
                <WorkoutCard
                  key={w.id}
                  workout={w}
                  onDelete={deleteWorkout}
                  onAddExercise={addExercise}
                  onDeleteExercise={deleteExercise}
                  onEditExercise={updateExercise}
                  onStartWorkout={(wId) => Alert.alert("Coming Soon", `Starting workout ${wId}`)}
                  onSaveAsTemplate={async (name, exercises) => {
                    try {
                      await addTemplate(name, exercises);
                      Alert.alert("Success", `Template "${name}" saved!`);
                    } catch (e: any) {
                      Alert.alert("Error", "Failed to save template: " + e.message);
                    }
                  }}
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
