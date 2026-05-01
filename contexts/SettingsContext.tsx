import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const STORAGE_KEY = '@gym_planner_settings';

export type WeightUnit = 'kg' | 'lb';
export type WeekStartsOn = 'monday' | 'sunday';

type UserSettings = {
  weight_unit: WeightUnit;
  week_starts_on: WeekStartsOn;
};

type SettingsContextType = {
  weightUnit: WeightUnit;
  weekStartsOn: WeekStartsOn;
  updateWeightUnit: (unit: WeightUnit) => Promise<void>;
  updateWeekStartsOn: (day: WeekStartsOn) => Promise<void>;
  convertToDisplay: (weightInKg: number | string | undefined) => number;
  convertToStorage: (weightInDisplay: number | string | undefined) => number;
  isLoading: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStartsOn>('monday');
  const [isLoading, setIsLoading] = useState(true);

  const isDemo = user?.id === 'demo-user-id';

  // Load settings initially
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        
        // 1. Try to load from Local Storage (always available for quick UI response)
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.weight_unit) setWeightUnit(parsed.weight_unit);
          if (parsed.week_starts_on) setWeekStartsOn(parsed.week_starts_on);
        }

        // 2. If authenticated, sync from Supabase profiles
        if (user && !isDemo) {
          const { data, error } = await supabase
            .from('profiles')
            .select('weight_unit, week_starts_on')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            setWeightUnit(data.weight_unit);
            setWeekStartsOn(data.week_starts_on);
            // Update local storage too to match cloud
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
              weight_unit: data.weight_unit,
              week_starts_on: data.week_starts_on
            }));
          } else if (error && error.code === 'PGRST116') {
            // Profile doesn't exist yet, insert with defaults
            await supabase.from('profiles').insert({
              id: user.id,
              weight_unit: weightUnit,
              week_starts_on: weekStartsOn
            });
          }
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const updateWeightUnit = async (unit: WeightUnit) => {
    setWeightUnit(unit);
    // Persist locally
    const current = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, weight_unit: unit }));

    // Persist to Supabase if authenticated
    if (user && !isDemo) {
      await supabase.from('profiles').update({ weight_unit: unit }).eq('id', user.id);
    }
  };

  const updateWeekStartsOn = async (day: WeekStartsOn) => {
    setWeekStartsOn(day);
    // Persist locally
    const current = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = current ? JSON.parse(current) : {};
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, week_starts_on: day }));

    // Persist to Supabase if authenticated
    if (user && !isDemo) {
      await supabase.from('profiles').update({ week_starts_on: day }).eq('id', user.id);
    }
  };

  const KG_TO_LB = 2.204622;

  const convertToDisplay = (weight: number | string | undefined): number => {
    if (weight === undefined || weight === "" || weight === null) return 0;
    const cleanWeight = typeof weight === 'string' ? weight.replace(/[^\d.]/g, '') : weight;
    const num = typeof cleanWeight === 'string' ? parseFloat(cleanWeight) : cleanWeight;
    if (isNaN(num)) return 0;

    if (weightUnit === 'lb') {
      return Math.round(num * KG_TO_LB);
    }
    return Math.round(num);
  };

  const convertToStorage = (weight: number | string | undefined): number => {
    if (weight === undefined || weight === "" || weight === null) return 0;
    const cleanWeight = typeof weight === 'string' ? weight.replace(/[^\d.]/g, '') : weight;
    const num = typeof cleanWeight === 'string' ? parseFloat(cleanWeight) : cleanWeight;
    if (isNaN(num)) return 0;

    if (weightUnit === 'lb') {
      return num / KG_TO_LB;
    }
    return num;
  };

  return (
    <SettingsContext.Provider value={{
      weightUnit,
      weekStartsOn,
      updateWeightUnit,
      updateWeekStartsOn,
      convertToDisplay,
      convertToStorage,
      isLoading
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
