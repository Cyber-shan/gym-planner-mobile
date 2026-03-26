import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ─── Stubbed Context types and data ─────────────────────────────────────
const PREBUILT_IDS = ["seed-t-1", "seed-t-2", "seed-t-3"];

export type WorkoutTemplate = {
  id: string;
  name: string;
  exercises: { name: string; sets: number; reps: number; category?: string; imageUrl?: string }[];
};

const DUMMY_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "seed-t-1",
    name: "Full Body Beginner",
    exercises: [
      { name: "Squats", sets: 3, reps: 10, category: "Legs" },
      { name: "Push-ups", sets: 3, reps: 10, category: "Chest" }
    ]
  },
  {
    id: "seed-t-2",
    name: "Upper Body Power",
    exercises: [
      { name: "Bench Press", sets: 5, reps: 5, category: "Chest" },
      { name: "Barbell Row", sets: 4, reps: 8, category: "Back" }
    ]
  },
  {
    id: "user-t-1",
    name: "My Custom Split",
    exercises: [
      { name: "Deadlift", sets: 3, reps: 5, category: "Back" },
      { name: "Pull-ups", sets: 3, reps: 8, category: "Back" }
    ]
  }
];
// ────────────────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = Math.min(width, 672) - 32;

// ─── Template Card Component ───
interface TemplateCardProps {
  template: WorkoutTemplate;
  isPrebuilt?: boolean;
  onUse: () => void;
  onDelete?: () => void;
}

function TemplateCard({ template, isPrebuilt, onUse, onDelete }: TemplateCardProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.dumbbellIconWrapper}>
            <FontAwesome5 name="dumbbell" size={12} color="#030213" />
          </View>
          <View>
            <Text style={styles.cardTitle}>{template.name}</Text>
            <Text style={styles.cardSubtitle}>
              {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        {!isPrebuilt && onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Feather name="trash-2" size={16} color="#717182" />
          </TouchableOpacity>
        )}
      </View>

      {/* Exercises List */}
      <View style={styles.cardBody}>
        {template.exercises.slice(0, 4).map((ex, i) => (
          <View key={i} style={styles.exerciseRow}>
            {ex.imageUrl && (
              <Image source={{ uri: ex.imageUrl }} style={styles.exerciseImage} />
            )}
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName} numberOfLines={1}>{ex.name}</Text>
              <Text style={styles.exerciseSets}>{ex.sets} × {ex.reps}</Text>
            </View>
            {ex.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{ex.category}</Text>
              </View>
            )}
          </View>
        ))}
        {template.exercises.length > 4 && (
          <Text style={styles.moreExercisesText}>+{template.exercises.length - 4} more exercises</Text>
        )}
      </View>

      {/* Action */}
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.useButton} onPress={onUse}>
          <FontAwesome5 name="play" size={10} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.useButtonText}>Use Template</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Page ───
export default function TemplatesPage() {
  const router = useRouter();
  
  const [templates, setTemplates] = useState(DUMMY_TEMPLATES);
  const [useTemplateId, setUseTemplateId] = useState<string | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  
  // Format today's date safely natively
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });

  const prebuiltTemplates = templates.filter(t => PREBUILT_IDS.includes(t.id));
  const userTemplates = templates.filter(t => !PREBUILT_IDS.includes(t.id));

  const handleScroll = (event: any) => {
    const slideSize = CAROUSEL_ITEM_WIDTH + 16;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeCarouselIndex && index >= 0 && index < prebuiltTemplates.length) {
      setActiveCarouselIndex(index);
    }
  };

  const handleUseTemplate = () => {
    if (!useTemplateId) return;
    const template = templates.find(t => t.id === useTemplateId);
    if (!template) return;
    
    // Simulate createWorkoutFromTemplate
    Alert.alert("Success", `Workout "${template.name}" created!`);
    setUseTemplateId(null);
    router.replace('/(app)');
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Template",
      `Delete template "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
             setTemplates(prev => prev.filter(t => t.id !== id));
             Alert.alert("Success", "Template deleted.");
          }
        }
      ]
    );
  };

  const openUseDialog = (id: string) => {
    setUseTemplateId(id);
    const d = new Date();
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  };

  const selectedTemplate = templates.find(t => t.id === useTemplateId);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* ── Pre-built Templates Horizontal Scroll (replacing Web Carousel) ── */}
        {prebuiltTemplates.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="magic" size={12} color="#030213" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Starter Templates</Text>
              <View style={styles.badgeSolid}>
                <Text style={styles.badgeSolidText}>Built-in</Text>
              </View>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              snapToInterval={CAROUSEL_ITEM_WIDTH + 16} 
              decelerationRate="fast" 
              contentContainerStyle={styles.carouselContainer}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {prebuiltTemplates.map(template => (
                <View key={template.id} style={styles.carouselSlide}>
                  <TemplateCard
                    template={template}
                    isPrebuilt
                    onUse={() => openUseDialog(template.id)}
                  />
                </View>
              ))}
            </ScrollView>

            {/* Pagination Indicators */}
            <View style={styles.paginationContainer}>
              {prebuiltTemplates.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.paginationDot, 
                    activeCarouselIndex === i && styles.paginationDotActive
                  ]} 
                />
              ))}
            </View>
          </View>
        )}

        {/* ── My Templates ── */}
        <View style={styles.section}>
          <View style={styles.myTemplatesHeader}>
             <Text style={styles.sectionTitle}>My Templates</Text>
             <Text style={styles.savedCountText}>{userTemplates.length} saved</Text>
          </View>

          {userTemplates.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Feather name="copy" size={32} color="#9ca3af" />
              </View>
              <Text style={styles.emptyTitle}>No custom templates yet</Text>
              <Text style={styles.emptySubtitle}>
                Save any workout as a template using the "Save as Template" button on workout cards. Then reuse them anytime.
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {userTemplates.map(template => (
                <View key={template.id} style={{ marginBottom: 16 }}>
                  <TemplateCard
                    template={template}
                    onUse={() => openUseDialog(template.id)}
                    onDelete={() => handleDelete(template.id, template.name)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
        
      </ScrollView>

      {/* ── Use Template Modal ── */}
      <Modal visible={!!useTemplateId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Workout from Template</Text>
            
            {selectedTemplate && (
              <View style={styles.modalBody}>
                <View style={styles.modalTemplateInfo}>
                  <Text style={styles.modalTemplateName}>{selectedTemplate.name}</Text>
                  <Text style={styles.modalTemplateDetail}>{selectedTemplate.exercises.length} exercises</Text>
                </View>
                
                <Text style={styles.modalLabel}>Workout Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                />
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setUseTemplateId(null)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={handleUseTemplate}>
                <Text style={styles.modalConfirmButtonText}>Create Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { paddingVertical: 24, paddingHorizontal: 16, alignSelf: 'center', width: '100%', maxWidth: 672 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0a0a0a', marginRight: 8 },
  badgeSolid: { backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeSolidText: { fontSize: 10, color: '#374151', fontWeight: '500' },
  carouselContainer: { paddingBottom: 8 },
  carouselSlide: { width: CAROUSEL_ITEM_WIDTH, marginRight: 16 },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  paginationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db', marginHorizontal: 4 },
  paginationDotActive: { width: 20, backgroundColor: '#030213' },
  myTemplatesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  savedCountText: { fontSize: 14, color: '#717182' },
  emptyState: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingVertical: 56, paddingHorizontal: 16 },
  emptyIconContainer: { backgroundColor: '#f3f4f6', padding: 20, borderRadius: 50, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#0a0a0a', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#717182', textAlign: 'center', maxWidth: 320, lineHeight: 20 },
  listContainer: { },
  // Card
  card: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  dumbbellIconWrapper: { backgroundColor: 'rgba(3, 2, 19, 0.05)', padding: 8, borderRadius: 8, marginRight: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#0a0a0a', marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: '#717182' },
  deleteButton: { padding: 4 },
  cardBody: { padding: 16, gap: 12 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center' },
  exerciseImage: { width: 32, height: 32, borderRadius: 4, marginRight: 8, backgroundColor: '#f3f4f6' },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 14, color: '#0a0a0a', fontWeight: '500' },
  exerciseSets: { fontSize: 12, color: '#717182', marginTop: 2 },
  categoryBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  categoryBadgeText: { fontSize: 10, color: '#374151', fontWeight: '500' },
  moreExercisesText: { fontSize: 12, color: '#717182', marginLeft: 40, marginTop: 4 },
  cardFooter: { paddingHorizontal: 16, paddingBottom: 16 },
  useButton: { backgroundColor: '#030213', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  useButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, backgroundColor: '#ffffff', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 16 },
  modalBody: { marginBottom: 24 },
  modalTemplateInfo: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  modalTemplateName: { fontSize: 16, fontWeight: '600', color: '#0a0a0a' },
  modalTemplateDetail: { fontSize: 14, color: '#717182', marginTop: 4 },
  modalLabel: { fontSize: 14, fontWeight: '500', color: '#0a0a0a', marginBottom: 8 },
  modalInput: { height: 44, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#0a0a0a', backgroundColor: '#ffffff' },
  modalFooter: { flexDirection: 'row', gap: 12 },
  modalCancelButton: { flex: 1, paddingVertical: 14, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, alignItems: 'center' },
  modalCancelButtonText: { color: '#0a0a0a', fontSize: 14, fontWeight: '600' },
  modalConfirmButton: { flex: 1, paddingVertical: 14, backgroundColor: '#030213', borderRadius: 8, alignItems: 'center' },
  modalConfirmButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' }
});
