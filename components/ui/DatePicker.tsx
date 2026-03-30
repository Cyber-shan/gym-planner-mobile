import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
}

/**
 * A shadcn-styled DatePicker for React Native.
 * Mimics the Popover + Button + Calendar aesthetic.
 */
export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [show, setShow] = useState(false);
  const dateValue = value ? new Date(value) : new Date();

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android, the picker closes immediately
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate && event.type !== 'dismissed') {
      const formatted = format(selectedDate, "yyyy-MM-dd");
      onChange(formatted);
    }
  };

  const togglePicker = () => setShow(prev => !prev);

  // For iOS, the picker is usually inline/compact in modern apps, 
  // but for a "popover" feel, we can show it as an overlay or just a modal.
  // Here we use the standard platform picker behavior.

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity 
        style={[styles.button, !value && styles.buttonEmpty]} 
        onPress={togglePicker}
        activeOpacity={0.7}
      >
        <Feather name="calendar" size={16} color="#717182" style={styles.icon} />
        <Text style={[styles.buttonText, !value && styles.buttonTextEmpty]}>
          {value ? format(new Date(value), "PPP") : "Pick a date"}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
          // Style for iOS inline
          themeVariant="light"
          textColor="#0a0a0a"
          accentColor="#030213"
        />
      )}

      {/* On iOS, if using 'inline', we might want a 'Done' button if it doesn't auto-dismiss 
          But traditionally 'inline' is better in a dedicated modal/view.
          For simplicity, we use the default platform behavior which is standard. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a0a0a',
    marginBottom: 8,
  },
  button: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
  },
  buttonEmpty: {
    // placeholder styles if any
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 15,
    color: '#0a0a0a',
    fontWeight: '400',
  },
  buttonTextEmpty: {
    color: '#9ca3af',
  },
});
