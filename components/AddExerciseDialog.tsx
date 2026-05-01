import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { exerciseDatabase, ExerciseTemplate } from '../data/exerciseDatabase';
import { getCategoryColor } from '../lib/colors';
import { Exercise } from './WorkoutCard';

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (exercise: Omit<Exercise, "id">) => void;
}

export function AddExerciseDialog({ open, onOpenChange, onAdd }: AddExerciseDialogProps) {
  const { weightUnit, convertToStorage } = useSettings();
  const [flowStep, setFlowStep] = useState<"select" | "browse" | "custom">("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseTemplate | null>(null);
  const [customName, setCustomName] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return exerciseDatabase;
    const query = searchQuery.toLowerCase();
    return exerciseDatabase.filter(
      (ex) => ex.name.toLowerCase().includes(query) || ex.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const sections = useMemo(() => {
    const grouped: Record<string, ExerciseTemplate[]> = {};
    filteredExercises.forEach((ex) => {
      if (!grouped[ex.category]) grouped[ex.category] = [];
      grouped[ex.category].push(ex);
    });

    const categories = Object.keys(grouped).sort();
    return categories.map(cat => ({
      title: cat,
      data: grouped[cat]
    }));
  }, [filteredExercises]);

  const handleSelectExercise = (ex: ExerciseTemplate) => {
    setSelectedExercise(ex);
    setCustomName("");
    setSets(ex.defaultSets.toString());
    setReps(ex.defaultReps.toString());
    setWeight(ex.defaultWeight || "");
  };

  const handleSubmit = () => {
    const finalName = selectedExercise?.name || customName.trim();
    if (finalName && sets && reps) {
      onAdd({
        name: finalName,
        sets: parseInt(sets) || 3,
        reps: parseInt(reps) || 10,
        weight: weight?.toLowerCase() === 'bodyweight' ? 'Bodyweight' : (weight ? String(convertToStorage(weight)) : undefined),
        notes: notes || undefined,
        imageUrl: selectedExercise?.imageUrl,
        category: selectedExercise?.category,
      });
      // Reset
      setFlowStep("select");
      setSearchQuery("");
      setSelectedExercise(null);
      setCustomName("");
      setSets("3");
      setReps("10");
      setWeight("");
      setNotes("");
      onOpenChange(false);
    }
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFlowStep("select");
      setSearchQuery("");
      setSelectedExercise(null);
      setCustomName("");
      setSets("3");
      setReps("10");
      setWeight("");
      setNotes("");
    }
    onOpenChange(isOpen);
  };

  const renderSelectFlow = () => (
    <View style={styles.flowContainer}>
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => setFlowStep("browse")}
      >
        <View style={styles.actionIconWrapper}>
          <Feather name="search" size={24} color="#030213" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Browse Exercises</Text>
          <Text style={styles.actionSubtitle}>Choose from our library of exercises with images and default settings</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => setFlowStep("custom")}
      >
        <View style={styles.actionIconWrapper}>
          <Feather name="edit-2" size={24} color="#030213" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Create Custom Exercise</Text>
          <Text style={styles.actionSubtitle}>Add your own exercise with custom name and details</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderBrowseFlow = () => (
    <View style={styles.flowContainer}>
      {!selectedExercise ? (
        <View style={styles.formGroupSpacer}>
          <Text style={styles.label}>Search Exercises</Text>
          <View style={styles.searchContainer}>
            <Feather name="search" size={16} color="#717182" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or category..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <SectionList
            sections={sections}
            keyExtractor={(item, index) => item.name + index}
            stickySectionHeadersEnabled={false}
            style={styles.scrollArea}
            contentContainerStyle={{ paddingBottom: 16 }}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{title}</Text>
              </View>
            )}
            renderItem={({ item: ex }) => (
              <TouchableOpacity style={styles.exOption} onPress={() => handleSelectExercise(ex)}>
                <View style={styles.exInfo}>
                  <View style={styles.exNameRow}>
                    <Text style={styles.exName}>{ex.name}</Text>
                    <View style={[styles.badge, { backgroundColor: getCategoryColor(ex.category).bg, marginTop: 0, marginLeft: 8 }]}>
                      <Text style={[styles.badgeText, { color: getCategoryColor(ex.category).text }]}>{ex.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.exDetails}>{ex.defaultSets} sets × {ex.defaultReps} reps</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              filteredExercises.length === 0 ? (
                <View style={styles.emptySearch}>
                  <Text style={styles.emptySearchText}>No exercises found. Try a different search term.</Text>
                </View>
              ) : null
            }
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.formGroupSpacer}>
          <Text style={styles.label}>Selected Exercise</Text>
          <View style={styles.selectedContent}>
            <View style={styles.exInfo}>
              <Text style={styles.exName}>{selectedExercise.name}</Text>
              <View style={[styles.badge, { backgroundColor: getCategoryColor(selectedExercise.category).bg }]}>
                <Text style={[styles.badgeText, { color: getCategoryColor(selectedExercise.category).text }]}>{selectedExercise.category}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedExercise(null)}>
              <Feather name="x" size={16} color="#0a0a0a" />
            </TouchableOpacity>
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.colGroup, { marginRight: 8 }]}>
              <Text style={styles.label}>Sets</Text>
              <TextInput style={styles.input} value={sets} onChangeText={setSets} keyboardType="numeric" />
            </View>
            <View style={[styles.colGroup, { marginLeft: 8 }]}>
              <Text style={styles.label}>Reps</Text>
              <TextInput style={styles.input} value={reps} onChangeText={setReps} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Weight (optional, in {weightUnit})</Text>
            <TextInput
              style={styles.input}
              placeholder={weightUnit === 'kg' ? "e.g., 60kg" : "e.g., 135lbs"}
              value={weight}
              onChangeText={setWeight}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      )}

      {/* Footer Buttons for Browse Flow */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setFlowStep("select");
            setSelectedExercise(null);
            setSearchQuery("");
          }}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, !selectedExercise && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={!selectedExercise}
        >
          <Text style={styles.submitButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCustomFlow = () => (
    <View style={styles.flowContainer}>
      <ScrollView
        contentContainerStyle={styles.formGroupSpacer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Exercise Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Cable Flyes"
            value={customName}
            onChangeText={setCustomName}
          />
        </View>

        <View style={styles.rowGroup}>
          <View style={[styles.colGroup, { marginRight: 8 }]}>
            <Text style={styles.label}>Sets</Text>
            <TextInput style={styles.input} value={sets} onChangeText={setSets} keyboardType="numeric" />
          </View>
          <View style={[styles.colGroup, { marginLeft: 8 }]}>
            <Text style={styles.label}>Reps</Text>
            <TextInput style={styles.input} value={reps} onChangeText={setReps} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Weight (optional, in {weightUnit})</Text>
          <TextInput
            style={styles.input}
            placeholder={weightUnit === 'kg' ? "e.g., 60kg" : "e.g., 135lbs"}
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Footer Buttons for Custom Flow */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setFlowStep("select");
            setCustomName("");
          }}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, !customName.trim() && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={!customName.trim()}
        >
          <Text style={styles.submitButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => handleDialogOpenChange(false)}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kbView}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Text style={styles.title}>
                  {flowStep === "select" ? "Add Exercise" : flowStep === "browse" ? "Browse Exercises" : "Create Custom Exercise"}
                </Text>
                <TouchableOpacity onPress={() => handleDialogOpenChange(false)}>
                  <Feather name="x" size={24} color="#717182" />
                </TouchableOpacity>
              </View>
              <Text style={styles.description}>
                {flowStep === "select"
                  ? "Choose how you'd like to add an exercise"
                  : flowStep === "browse"
                    ? "Select an exercise from our library"
                    : "Create your own custom exercise"}
              </Text>
            </View>



            <View style={styles.flowWrapper}>
              {flowStep === "select" && renderSelectFlow()}
              {flowStep === "browse" && renderBrowseFlow()}
              {flowStep === "custom" && renderCustomFlow()}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  kbView: { width: '100%', alignItems: 'center' },
  content: { width: '100%', maxWidth: 500, backgroundColor: '#ffffff', borderRadius: 20, paddingTop: 24, paddingHorizontal: 24, paddingBottom: 32, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  flowWrapper: { width: '100%' },
  header: { marginBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '700', color: '#0a0a0a' },
  description: { fontSize: 14, color: '#717182' },
  flowContainer: { width: '100%' },
  actionCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 12, backgroundColor: '#ffffff' },
  actionIconWrapper: { width: 48, height: 48, borderRadius: 8, backgroundColor: 'rgba(3, 2, 19, 0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: '#0a0a0a', marginBottom: 4 },
  actionSubtitle: { fontSize: 13, color: '#717182', lineHeight: 18 },
  formGroupSpacer: { gap: 12, paddingBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#0a0a0a', marginBottom: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, height: 44, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: '100%', fontSize: 16 },
  scrollArea: { height: 250, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, marginBottom: 16 },
  categoryHeader: { backgroundColor: '#030213', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'flex-start', marginVertical: 12, marginLeft: 4 },
  categoryTitle: { fontSize: 13, fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.8 },
  exOption: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8 },
  exInfo: { flex: 1 },
  exNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  exName: { fontSize: 14, fontWeight: '500', color: '#0a0a0a' },
  exDetails: { fontSize: 12, color: '#717182' },
  emptySearch: { padding: 24, alignItems: 'center' },
  emptySearchText: { color: '#717182', fontSize: 14 },
  input: { height: 48, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#0a0a0a', backgroundColor: '#ffffff' },
  selectedContent: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, marginBottom: 16 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  closeBtn: { padding: 8 },
  rowGroup: { flexDirection: 'row', marginBottom: 16 },
  colGroup: { flex: 1 },
  formGroup: { marginBottom: 16 },
  textArea: { height: 80, paddingTop: 10, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', gap: 12, marginTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16 },
  cancelButton: { flex: 1, paddingVertical: 14, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#0a0a0a', fontSize: 14, fontWeight: '600' },
  submitButton: { flex: 1, paddingVertical: 14, backgroundColor: '#030213', borderRadius: 8, alignItems: 'center' },
  disabledBtn: { opacity: 0.5 },
  submitButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' }
});
