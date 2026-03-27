import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { AddExerciseDialog } from './AddExerciseDialog';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: string;
  notes?: string;
  imageUrl?: string;
  category?: string;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
}

interface WorkoutCardProps {
  workout: Workout;
  onDelete: (id: string) => void;
  onAddExercise: (workoutId: string, exercise: Omit<Exercise, 'id'>) => void;
  onDeleteExercise: (workoutId: string, exerciseId: string) => void;
  onEditExercise: (workoutId: string, exerciseId: string, updatedExercise: Partial<Exercise>) => void;
  onStartWorkout: (workoutId: string) => void;
  onSaveAsTemplate: (name: string, exercises: Exercise[]) => void;
}

export function WorkoutCard({
  workout,
  onDelete,
  onAddExercise,
  onDeleteExercise,
  onEditExercise,
  onStartWorkout,
  onSaveAsTemplate,
}: WorkoutCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ sets: 0, reps: 0, weight: "", notes: "" });
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState(workout.name);
  const [showAddExercise, setShowAddExercise] = useState(false);

  const startEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setEditForm({
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight || "",
      notes: exercise.notes || "",
    });
  };

  const saveEdit = (exerciseId: string) => {
    onEditExercise(workout.id, exerciseId, editForm);
    setEditingId(null);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    onSaveAsTemplate(templateName.trim(), workout.exercises);
    setShowTemplateDialog(false);
  };

  let displayDate = workout.date;
  try {
    const d = new Date(workout.date + "T00:00:00");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // e.g. "Wed, Jan 14"
    if (!isNaN(d.getTime())) {
      displayDate = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
    }
  } catch { /* keep raw */ }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{workout.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{workout.exercises.length} exercises</Text>
            </View>
          </View>
          <Text style={styles.dateText}>{displayDate}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsExpanded(!isExpanded)}>
            <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#717182" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => onDelete(workout.id)}>
            <Feather name="trash-2" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      {isExpanded && (
        <View style={styles.body}>
          {workout.exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No exercises added yet</Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowAddExercise(true)}>
                <Feather name="plus" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.addFirstButtonText}>Add First Exercise</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.exerciseList}>
              {workout.exercises.map(exercise => (
                <View key={exercise.id} style={styles.exerciseItem}>
                  {editingId === exercise.id ? (
                    // Edit Form
                    <View style={styles.editForm}>
                       <Text style={styles.editExerciseName}>{exercise.name}</Text>
                       <View style={styles.editRow}>
                         <View style={styles.editCol}>
                           <Text style={styles.editLabel}>Sets</Text>
                           <TextInput 
                             style={styles.editInput} 
                             value={String(editForm.sets)} 
                             keyboardType="numeric"
                             onChangeText={t => setEditForm(p => ({ ...p, sets: parseInt(t) || 0 }))} 
                           />
                         </View>
                         <View style={styles.editCol}>
                           <Text style={styles.editLabel}>Reps</Text>
                           <TextInput 
                             style={styles.editInput} 
                             value={String(editForm.reps)} 
                             keyboardType="numeric"
                             onChangeText={t => setEditForm(p => ({ ...p, reps: parseInt(t) || 0 }))} 
                           />
                         </View>
                         <View style={styles.editCol}>
                           <Text style={styles.editLabel}>Weight</Text>
                           <TextInput 
                             style={styles.editInput} 
                             value={editForm.weight} 
                             placeholder="50kg"
                             onChangeText={t => setEditForm(p => ({ ...p, weight: t }))} 
                           />
                         </View>
                       </View>
                       <View style={styles.editNotesRow}>
                         <Text style={styles.editLabel}>Notes</Text>
                         <TextInput
                           style={styles.editTextarea}
                           value={editForm.notes}
                           onChangeText={t => setEditForm(p => ({ ...p, notes: t }))}
                           multiline
                           placeholder="Add notes..."
                         />
                       </View>
                       <View style={styles.editActions}>
                         <TouchableOpacity style={[styles.editIconButton, { backgroundColor: '#f0fdf4' }]} onPress={() => saveEdit(exercise.id)}>
                           <Feather name="check" size={16} color="#16a34a" />
                         </TouchableOpacity>
                         <TouchableOpacity style={[styles.editIconButton, { backgroundColor: '#fef2f2' }]} onPress={() => setEditingId(null)}>
                           <Feather name="x" size={16} color="#ef4444" />
                         </TouchableOpacity>
                       </View>
                    </View>
                  ) : (
                    // Read-only View
                    <View style={styles.exerciseRow}>
                      {exercise.imageUrl && (
                        <Image source={{ uri: exercise.imageUrl }} style={styles.exerciseImage} />
                      )}
                      <View style={styles.exerciseContent}>
                        <View style={styles.exerciseTitleRow}>
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                          {exercise.category && (
                            <View style={styles.exerciseBadge}>
                              <Text style={styles.exerciseBadgeText}>{exercise.category}</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.exerciseDetailsRow}>
                          <Text style={styles.exerciseDetailsText}>{exercise.sets} sets × {exercise.reps} reps</Text>
                          {!!exercise.weight && <Text style={styles.exerciseDetailsText}>  •  {exercise.weight}</Text>}
                        </View>
                        {!!exercise.notes && (
                          <Text style={styles.exerciseNotesText}>{exercise.notes}</Text>
                        )}
                      </View>
                      <View style={styles.exerciseActions}>
                        <TouchableOpacity style={styles.iconButtonSm} onPress={() => startEdit(exercise)}>
                          <Feather name="edit-2" size={14} color="#717182" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButtonSm} onPress={() => onDeleteExercise(workout.id, exercise.id)}>
                          <Feather name="trash-2" size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addExerciseButton} onPress={() => setShowAddExercise(true)}>
                <Feather name="plus" size={16} color="#0a0a0a" style={{ marginRight: 6 }} />
                <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
              </TouchableOpacity>

              <View style={styles.cardFooterActions}>
                <TouchableOpacity style={styles.outlineButton} onPress={() => { setTemplateName(workout.name); setShowTemplateDialog(true); }}>
                  <Feather name="copy" size={14} color="#0a0a0a" style={{ marginRight: 8 }} />
                  <Text style={styles.outlineButtonText}>Save Template</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.solidButton} onPress={() => onStartWorkout(workout.id)}>
                  <FontAwesome5 name="play" size={12} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.solidButtonText}>Start Workout</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        </View>
      )}

      {/* Add Exercise Modal */}
      <AddExerciseDialog 
        open={showAddExercise} 
        onOpenChange={setShowAddExercise} 
        onAdd={(ex) => {
          onAddExercise(workout.id, ex);
          setShowAddExercise(false);
        }} 
      />

      {/* Save Template Modal */}
      <Modal visible={showTemplateDialog} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Save as Template</Text>
                
                <View style={styles.modalBody}>
                  <Text style={styles.modalLabel}>Template Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={templateName}
                    onChangeText={setTemplateName}
                    placeholder="e.g., Push Day"
                  />
                  <Text style={styles.modalDesc}>
                    Saves {workout.exercises.length} exercise{workout.exercises.length !== 1 ? "s" : ""} as a reusable template.
                  </Text>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowTemplateDialog(false)}>
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalSubmitButton, !templateName.trim() && { opacity: 0.5 }]} 
                    onPress={handleSaveTemplate}
                    disabled={!templateName.trim()}
                  >
                    <Text style={styles.modalSubmitButtonText}>Save Template</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerLeft: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '700', color: '#0a0a0a' },
  badge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '500', color: '#374151' },
  dateText: { fontSize: 13, color: '#717182' },
  headerRight: { flexDirection: 'row', gap: 4, paddingLeft: 8, alignItems: 'flex-start' },
  iconButton: { padding: 4 },
  iconButtonSm: { padding: 8 },
  body: { padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyStateText: { fontSize: 14, color: '#717182', marginBottom: 16 },
  addFirstButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#030213', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  addFirstButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  exerciseList: { gap: 12 },
  exerciseItem: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, backgroundColor: '#f9fafb', padding: 12 },
  exerciseRow: { flexDirection: 'row' },
  exerciseImage: { width: 64, height: 64, borderRadius: 6, backgroundColor: '#e5e7eb', marginRight: 12 },
  exerciseContent: { flex: 1 },
  exerciseTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  exerciseName: { fontSize: 14, fontWeight: '600', color: '#0a0a0a' },
  exerciseBadge: { backgroundColor: '#e5e7eb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  exerciseBadgeText: { fontSize: 10, color: '#374151', fontWeight: '500' },
  exerciseDetailsRow: { flexDirection: 'row', alignItems: 'center' },
  exerciseDetailsText: { fontSize: 12, color: '#717182' },
  exerciseNotesText: { fontSize: 13, color: '#4b5563', marginTop: 6, fontStyle: 'italic' },
  exerciseActions: { flexDirection: 'row', gap: 0, paddingLeft: 8 },
  editForm: { },
  editExerciseName: { fontSize: 14, fontWeight: '600', color: '#0a0a0a', marginBottom: 12 },
  editRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  editCol: { flex: 1 },
  editLabel: { fontSize: 12, color: '#717182', marginBottom: 4 },
  editInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, height: 36, paddingHorizontal: 8, fontSize: 14, color: '#0a0a0a' },
  editNotesRow: { marginBottom: 16 },
  editTextarea: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, minHeight: 60, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 8, fontSize: 14, color: '#0a0a0a', textAlignVertical: 'top' },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  editIconButton: { padding: 8, borderRadius: 6 },
  addExerciseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 10, borderRadius: 8, marginTop: 4 },
  addExerciseButtonText: { color: '#0a0a0a', fontSize: 13, fontWeight: '500' },
  cardFooterActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  outlineButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 12, borderRadius: 8, backgroundColor: '#ffffff' },
  outlineButtonText: { fontSize: 13, fontWeight: '500', color: '#0a0a0a' },
  solidButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#030213', paddingVertical: 12, borderRadius: 8 },
  solidButtonText: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, backgroundColor: '#ffffff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 16 },
  modalBody: { marginBottom: 24 },
  modalLabel: { fontSize: 14, fontWeight: '500', color: '#0a0a0a', marginBottom: 8 },
  modalInput: { height: 44, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#0a0a0a', backgroundColor: '#ffffff', marginBottom: 12 },
  modalDesc: { fontSize: 13, color: '#717182' },
  modalFooter: { flexDirection: 'row', gap: 12 },
  modalCancelButton: { flex: 1, paddingVertical: 14, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, alignItems: 'center' },
  modalCancelButtonText: { color: '#0a0a0a', fontSize: 14, fontWeight: '600' },
  modalSubmitButton: { flex: 1, paddingVertical: 14, backgroundColor: '#030213', borderRadius: 8, alignItems: 'center' },
  modalSubmitButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' }
});
