import { WorkoutTemplate } from '../app/(app)/templates';

// Starter templates based on popular training splits
// These use exercises from exerciseDatabase.ts for consistency

export const STARTER_TEMPLATE_IDS = [
  'starter-push', 'starter-pull', 'starter-legs',
  'starter-upper', 'starter-lower', 'starter-fullbody'
];

export const starterTemplates: WorkoutTemplate[] = [
  {
    id: 'starter-push',
    name: 'Push Day',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, category: 'Chest', weight: '20' },
      { name: 'Overhead Press', sets: 3, reps: 10, category: 'Shoulders', weight: '20' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10, category: 'Chest', weight: '8' },
      { name: 'Cable Crossover', sets: 3, reps: 12, category: 'Chest', weight: '5' },
      { name: 'Lateral Raise', sets: 3, reps: 15, category: 'Shoulders', weight: '4' },
      { name: 'Tricep Pushdown', sets: 3, reps: 15, category: 'Arms', weight: '10' },
    ],
  },
  {
    id: 'starter-pull',
    name: 'Pull Day',
    exercises: [
      { name: 'Deadlift', sets: 3, reps: 5, category: 'Back', weight: '40' },
      { name: 'Barbell Row', sets: 4, reps: 8, category: 'Back', weight: '20' },
      { name: 'Pull-ups', sets: 3, reps: 10, category: 'Back', weight: 'Bodyweight' },
      { name: 'Seated Cable Row', sets: 3, reps: 10, category: 'Back', weight: '20' },
      { name: 'Bicep Curls', sets: 3, reps: 12, category: 'Arms', weight: '6' },
      { name: 'Face Pulls', sets: 3, reps: 15, category: 'Shoulders', weight: '10' },
    ],
  },
  {
    id: 'starter-legs',
    name: 'Leg Day',
    exercises: [
      { name: 'Squat', sets: 4, reps: 8, category: 'Legs', weight: '20' },
      { name: 'Romanian Deadlift (RDL)', sets: 3, reps: 10, category: 'Legs', weight: '20' },
      { name: 'Leg Press', sets: 3, reps: 10, category: 'Legs', weight: '40' },
      { name: 'Walking Lunges', sets: 3, reps: 12, category: 'Legs', weight: 'Bodyweight' },
      { name: 'Leg Extension', sets: 3, reps: 12, category: 'Legs', weight: '15' },
      { name: 'Standing Calf Raise', sets: 4, reps: 15, category: 'Legs', weight: '20' },
    ],
  },
  {
    id: 'starter-upper',
    name: 'Upper Body',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, category: 'Chest', weight: '20' },
      { name: 'Barbell Row', sets: 4, reps: 8, category: 'Back', weight: '20' },
      { name: 'Overhead Press', sets: 3, reps: 10, category: 'Shoulders', weight: '20' },
      { name: 'Pull-ups', sets: 3, reps: 10, category: 'Back', weight: 'Bodyweight' },
      { name: 'Bicep Curls', sets: 3, reps: 12, category: 'Arms', weight: '6' },
      { name: 'Tricep Extension', sets: 3, reps: 12, category: 'Arms', weight: '6' },
    ],
  },
  {
    id: 'starter-lower',
    name: 'Lower Body',
    exercises: [
      { name: 'Squat', sets: 4, reps: 8, category: 'Legs', weight: '20' },
      { name: 'Romanian Deadlift (RDL)', sets: 3, reps: 10, category: 'Legs', weight: '20' },
      { name: 'Leg Press', sets: 3, reps: 10, category: 'Legs', weight: '40' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: 8, category: 'Legs', weight: 'Bodyweight' },
      { name: 'Lying Leg Curl', sets: 3, reps: 12, category: 'Legs', weight: '15' },
      { name: 'Standing Calf Raise', sets: 4, reps: 15, category: 'Legs', weight: '20' },
    ],
  },
  {
    id: 'starter-fullbody',
    name: 'Full Body',
    exercises: [
      { name: 'Squat', sets: 3, reps: 8, category: 'Legs', weight: '20' },
      { name: 'Bench Press', sets: 3, reps: 10, category: 'Chest', weight: '20' },
      { name: 'Deadlift', sets: 3, reps: 5, category: 'Back', weight: '40' },
      { name: 'Overhead Press', sets: 3, reps: 10, category: 'Shoulders', weight: '20' },
      { name: 'Pull-ups', sets: 3, reps: 10, category: 'Back', weight: 'Bodyweight' },
      { name: 'Plank', sets: 3, reps: 1, category: 'Core', weight: 'Bodyweight' },
    ],
  },
];
