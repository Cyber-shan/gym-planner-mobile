import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Exercise, Workout } from '../components/WorkoutCard';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface ActiveSet {
  setNumber: number;
  plannedReps: number;
  actualReps: number;
  weight: string;
  completed: boolean;
}

export interface ActiveExercise {
  id: string;
  name: string;
  category?: string;
  sets: ActiveSet[];
}

export interface CompletedSession {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  completedAt: string;
  durationMinutes: number;
  exercises: ActiveExercise[];
}

type WorkoutContextType = {
  workouts: Workout[];
  isLoading: boolean;
  completedSessions: CompletedSession[];
  addWorkout: (name: string, date: string) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  addExercise: (workoutId: string, exercise: Omit<Exercise, 'id'>) => Promise<void>;
  deleteExercise: (workoutId: string, exerciseId: string) => Promise<void>;
  updateExercise: (workoutId: string, exerciseId: string, updated: Partial<Exercise>) => Promise<void>;
  createWorkoutFromTemplate: (name: string, date: string, exercises: any[]) => Promise<void>;
  addCompletedSession: (session: Omit<CompletedSession, 'id'>) => Promise<void>;
  refreshWorkouts: () => Promise<void>;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isDemo = user?.id === 'demo-user-id';

  const fetchWorkouts = async () => {
    if (!user) {
      setWorkouts([]);
      setIsLoading(false);
      return;
    }
    if (isDemo) {
      // Use local state (keep what's there)
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          id, name, date,
          exercises ( id, name, sets, reps, weight, notes, category, image_url )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      // Map DB exercises to the Workout interface (image_url -> imageUrl)
      const formatted: Workout[] = (data || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        date: w.date,
        exercises: (w.exercises || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
          notes: e.notes,
          category: e.category,
          imageUrl: e.image_url
        }))
      }));

      setWorkouts(formatted);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompletedSessions = async () => {
    if (!user || isDemo) {
      setCompletedSessions([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('completed_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const formatted: CompletedSession[] = (data || []).map((s: any) => ({
        id: s.id,
        workoutId: s.workout_id,
        workoutName: s.workout_name,
        date: s.date,
        completedAt: s.completed_at,
        durationMinutes: s.duration_minutes,
        exercises: s.exercises,
      }));
      setCompletedSessions(formatted);
    } catch (e: any) {
      console.error('Failed to fetch completed sessions:', e.message);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    fetchCompletedSessions();
  }, [user]);

  const addWorkout = async (name: string, date: string) => {
    if (isDemo) {
      const dummy: Workout = { id: Math.random().toString(), name, date, exercises: [] };
      setWorkouts(prev => [dummy, ...prev]);
      return;
    }

    const { data, error } = await supabase
      .from('workouts')
      .insert({ user_id: user?.id, name, date })
      .select()
      .single();

    if (error) {
      throw error;
    }
    setWorkouts(prev => [{ ...data, exercises: [] }, ...prev]);
  };

  const deleteWorkout = async (id: string) => {
    if (isDemo) {
      setWorkouts(prev => prev.filter(w => w.id !== id));
      return;
    }

    const { error } = await supabase.from('workouts').delete().eq('id', id);
    if (error) throw error;
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const addExercise = async (workoutId: string, exercisePayload: Omit<Exercise, 'id'>) => {
    if (isDemo) {
      setWorkouts(prev => prev.map(w => {
        if (w.id === workoutId) {
          return { ...w, exercises: [...w.exercises, { ...exercisePayload, id: Math.random().toString() }] };
        }
        return w;
      }));
      return;
    }

    const { data, error } = await supabase
      .from('exercises')
      .insert({
        workout_id: workoutId,
        name: exercisePayload.name,
        sets: exercisePayload.sets,
        reps: exercisePayload.reps,
        weight: exercisePayload.weight || null,
        notes: exercisePayload.notes || null,
        category: exercisePayload.category || null,
        image_url: exercisePayload.imageUrl || null
      })
      .select()
      .single();

    if (error) throw error;

    const mappedData: Exercise = {
      id: data.id,
      name: data.name,
      sets: data.sets,
      reps: data.reps,
      weight: data.weight,
      notes: data.notes,
      category: data.category,
      imageUrl: data.image_url
    };

    setWorkouts(prev => prev.map(w => {
      if (w.id === workoutId) {
        return { ...w, exercises: [...w.exercises, mappedData] };
      }
      return w;
    }));
  };

  const deleteExercise = async (workoutId: string, exerciseId: string) => {
    if (isDemo) {
      setWorkouts(prev => prev.map(w => {
        if (w.id === workoutId) {
          return { ...w, exercises: w.exercises.filter(e => e.id !== exerciseId) };
        }
        return w;
      }));
      return;
    }

    const { error } = await supabase.from('exercises').delete().eq('id', exerciseId);
    if (error) throw error;

    setWorkouts(prev => prev.map(w => {
      if (w.id === workoutId) {
        return { ...w, exercises: w.exercises.filter(e => e.id !== exerciseId) };
      }
      return w;
    }));
  };

  const updateExercise = async (workoutId: string, exerciseId: string, updated: Partial<Exercise>) => {
    if (isDemo) {
      setWorkouts(prev => prev.map(w => {
        if (w.id === workoutId) {
          return { ...w, exercises: w.exercises.map(e => e.id === exerciseId ? { ...e, ...updated } : e) };
        }
        return w;
      }));
      return;
    }

    const dbPayload: any = { ...updated };
    if (dbPayload.imageUrl !== undefined) {
      dbPayload.image_url = dbPayload.imageUrl;
      delete dbPayload.imageUrl;
    }

    const { error } = await supabase.from('exercises').update(dbPayload).eq('id', exerciseId);
    if (error) throw error;

    setWorkouts(prev => prev.map(w => {
      if (w.id === workoutId) {
        return { ...w, exercises: w.exercises.map(e => e.id === exerciseId ? { ...e, ...updated } : e) };
      }
      return w;
    }));
  };

  const createWorkoutFromTemplate = async (name: string, date: string, templateExercises: any[]) => {
    if (isDemo) {
      const dummy: Workout = {
        id: Math.random().toString(),
        name,
        date,
        exercises: templateExercises.map(e => ({ ...e, id: Math.random().toString() }))
      };
      setWorkouts(prev => [dummy, ...prev]);
      return;
    }

    // 1. Insert Workout
    const { data: wData, error: wError } = await supabase
      .from('workouts')
      .insert({ user_id: user?.id, name, date })
      .select()
      .single();

    if (wError) throw wError;

    // 2. Insert Exercises
    if (templateExercises.length > 0) {
      const exPayloads = templateExercises.map(e => ({
        workout_id: wData.id,
        name: e.name,
        sets: e.sets || 0,
        reps: e.reps || 0,
        weight: e.weight || null,
        notes: e.notes || null,
        category: e.category || null,
        image_url: e.imageUrl || null
      }));

      const { data: eData, error: eError } = await supabase
        .from('exercises')
        .insert(exPayloads)
        .select();

      if (eError) throw eError;

      const mappedExercises = (eData || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        weight: e.weight,
        notes: e.notes,
        category: e.category,
        imageUrl: e.image_url
      }));

      setWorkouts(prev => [{ ...wData, exercises: mappedExercises }, ...prev]);
    } else {
      setWorkouts(prev => [{ ...wData, exercises: [] }, ...prev]);
    }
  };

  const addCompletedSession = async (sessionPayload: Omit<CompletedSession, 'id'>) => {
    if (isDemo) {
      const newSession: CompletedSession = {
        ...sessionPayload,
        id: Math.random().toString(36).substr(2, 9),
      };
      setCompletedSessions(prev => [newSession, ...prev]);
      return;
    }

    const { data, error } = await supabase
      .from('completed_sessions')
      .insert({
        user_id: user?.id,
        workout_id: sessionPayload.workoutId || null,
        workout_name: sessionPayload.workoutName,
        date: sessionPayload.date,
        completed_at: sessionPayload.completedAt,
        duration_minutes: sessionPayload.durationMinutes,
        exercises: sessionPayload.exercises,
      })
      .select()
      .single();

    if (error) throw error;

    const newSession: CompletedSession = {
      id: data.id,
      workoutId: data.workout_id,
      workoutName: data.workout_name,
      date: data.date,
      completedAt: data.completed_at,
      durationMinutes: data.duration_minutes,
      exercises: data.exercises,
    };

    setCompletedSessions(prev => [newSession, ...prev]);
  };

  return (
    <WorkoutContext.Provider value={{
      workouts,
      isLoading,
      completedSessions,
      addWorkout,
      deleteWorkout,
      addExercise,
      deleteExercise,
      updateExercise,
      createWorkoutFromTemplate,
      addCompletedSession,
      refreshWorkouts: fetchWorkouts,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  return context;
}
