import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';

interface AddWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, date: string) => void;
}

export function AddWorkoutDialog({ open, onOpenChange, onAdd }: AddWorkoutDialogProps) {
  const [name, setName] = useState("");
  
  // Simple YYYY-MM-DD local timezone initialization without date-fns
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name, date);
      setName("");
      const d = new Date();
      setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      onOpenChange(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kbView}>
            <View style={styles.content}>
              
              <View style={styles.header}>
                <Text style={styles.title}>Create New Workout</Text>
                <Text style={styles.description}>Add a new workout plan to your training schedule</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Workout Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Chest & Triceps"
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Date</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: '#f3f4f6', color: '#6b7280' }]}
                    value={date}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => onOpenChange(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Create Workout</Text>
                </TouchableOpacity>
              </View>

            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  kbView: {
    width: '100%',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a0a0a',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#717182',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a0a0a',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0a0a0a',
    backgroundColor: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#030213',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
