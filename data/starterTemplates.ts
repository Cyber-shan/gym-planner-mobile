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
      { name: 'Bench Press', sets: 4, reps: 8, category: 'Chest' },
      { name: 'Overhead Press', sets: 3, reps: 10, category: 'Shoulders' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10, category: 'Chest' },
      { name: 'Cable Crossover', sets: 3, reps: 12, category: 'Chest' },
      { name: 'Lateral Raise', sets: 3, reps: 15, category: 'Shoulders' },
      { name: 'Tricep Pushdown', sets: 3, reps: 15, category: 'Arms' },
    ],
  },
  {
    id: 'starter-pull',
    name: 'Pull Day',
    exercises: [
      { name: 'Deadlift', sets: 3, reps: 5, category: 'Back' },
      { name: 'Barbell Row', sets: 4, reps: 8, category: 'Back' },
      { name: 'Pull-ups', sets: 3, reps: 10, category: 'Back' },
      { name: 'Seated Cable Row', sets: 3, reps: 10, category: 'Back' },
      { name: 'Bicep Curls', sets: 3, reps: 12, category: 'Arms' },
      { name: 'Face Pulls', sets: 3, reps: 15, category: 'Shoulders' },
    ],
  },
  {
    id: 'starter-legs',
    name: 'Leg Day',
    exercises: [
      { name: 'Squat', sets: 4, reps: 8, category: 'Legs' },
      { name: 'Romanian Deadlift (RDL)', sets: 3, reps: 10, category: 'Legs' },
      { name: 'Leg Press', sets: 3, reps: 10, category: 'Legs' },
      { name: 'Walking Lunges', sets: 3, reps: 12, category: 'Legs' },
      { name: 'Leg Extension', sets: 3, reps: 12, category: 'Legs' },
      { name: 'Standing Calf Raise', sets: 4, reps: 15, category: 'Legs' },
    ],
  },
  {
    id: 'starter-upper',
    name: 'Upper Body',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, category: 'Chest' },
      { name: 'Barbell Row', sets: 4, reps: 8, category: 'Back' },
      { name: 'Overhead Press', sets: 3, reps: 10, category: 'Shoulders' },
      { name: 'Pull-ups', sets: 3, reps: 10, category: 'Back' },
      { name: 'Bicep Curls', sets: 3, reps: 12, category: 'Arms' },
      { name: 'Tricep Extension', sets: 3, reps: 12, category: 'Arms' },
    ],
  },
  {
    id: 'starter-lower',
    name: 'Lower Body',
    exercises: [
      { name: 'Squat', sets: 4, reps: 8, category: 'Legs' },
      { name: 'Romanian Deadlift (RDL)', sets: 3, reps: 10, category: 'Legs' },
      { name: 'Leg Press', sets: 3, reps: 10, category: 'Legs' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: 8, category: 'Legs' },
      { name: 'Lying Leg Curl', sets: 3, reps: 12, category: 'Legs' },
      { name: 'Standing Calf Raise', sets: 4, reps: 15, category: 'Legs' },
    ],
  },
  {
    id: 'starter-fullbody',
    name: 'Full Body',
    exercises: [
      { name: 'Squat', sets: 3, reps: 8, category: 'Legs' },
      { name: 'Bench Press', sets: 3, reps: 10, category: 'Chest' },
      { name: 'Deadlift', sets: 3, reps: 5, category: 'Back' },
      { name: 'Overhead Press', sets: 3, reps: 10, category: 'Shoulders' },
      { name: 'Pull-ups', sets: 3, reps: 10, category: 'Back' },
      { name: 'Plank', sets: 3, reps: 1, category: 'Core' },
    ],
  },
];
