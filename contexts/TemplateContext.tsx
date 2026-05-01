import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { WorkoutTemplate } from '../app/(app)/templates';
import { starterTemplates, STARTER_TEMPLATE_IDS } from '../data/starterTemplates';

const STORAGE_KEY = '@gym_planner_user_templates';

type TemplateContextType = {
  templates: WorkoutTemplate[];
  starterTemplatesList: WorkoutTemplate[];
  userTemplatesList: WorkoutTemplate[];
  addTemplate: (name: string, exercises: WorkoutTemplate['exercises']) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
};

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userTemplates, setUserTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const isDemo = user?.id === 'demo-user-id';

  // Fetch templates when user changes
  useEffect(() => {
    if (!user) {
      setUserTemplates([]);
      setIsLoaded(true);
      return;
    }

    if (isDemo) {
      // Demo mode: load from AsyncStorage
      (async () => {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) setUserTemplates(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to load local templates:', e);
        } finally {
          setIsLoaded(true);
        }
      })();
      return;
    }

    // Authenticated user: load from Supabase
    (async () => {
      try {
        const { data, error } = await supabase
          .from('templates')
          .select('id, name, exercises, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped: WorkoutTemplate[] = (data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          exercises: t.exercises || [],
        }));

        setUserTemplates(mapped);
      } catch (e) {
        console.error('Failed to fetch templates from Supabase:', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, [user]);

  // Persist demo templates to AsyncStorage
  useEffect(() => {
    if (!isLoaded || !isDemo) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates)).catch(e =>
      console.error('Failed to save local templates:', e)
    );
  }, [userTemplates, isLoaded, isDemo]);

  const addTemplate = async (name: string, exercises: WorkoutTemplate['exercises']) => {
    if (isDemo) {
      const newTemplate: WorkoutTemplate = {
        id: `user-t-${Date.now()}`,
        name,
        exercises,
      };
      setUserTemplates(prev => [newTemplate, ...prev]);
      return;
    }

    // Authenticated: insert into Supabase
    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: user?.id,
        name,
        exercises,
      })
      .select()
      .single();

    if (error) throw error;

    const newTemplate: WorkoutTemplate = {
      id: data.id,
      name: data.name,
      exercises: data.exercises || [],
    };
    setUserTemplates(prev => [newTemplate, ...prev]);
  };

  const deleteTemplate = async (id: string) => {
    if (STARTER_TEMPLATE_IDS.includes(id)) return;

    if (isDemo) {
      setUserTemplates(prev => prev.filter(t => t.id !== id));
      return;
    }

    // Authenticated: delete from Supabase
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) throw error;
    setUserTemplates(prev => prev.filter(t => t.id !== id));
  };

  const allTemplates = [...starterTemplates, ...userTemplates];

  return (
    <TemplateContext.Provider value={{
      templates: allTemplates,
      starterTemplatesList: starterTemplates,
      userTemplatesList: userTemplates,
      addTemplate,
      deleteTemplate,
    }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplates() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
}
