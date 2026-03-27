export interface ExerciseTemplate {
  name: string;
  category: string;
  defaultSets: number;
  defaultReps: number;
  imageUrl?: string;
}

export const exerciseDatabase: ExerciseTemplate[] = [
  // Chest
  { name: "Bench Press", category: "Chest", defaultSets: 3, defaultReps: 10, imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop" },
  { name: "Incline Dumbbell Press", category: "Chest", defaultSets: 3, defaultReps: 10, imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop" },
  { name: "Cable Crossover", category: "Chest", defaultSets: 3, defaultReps: 12 },
  { name: "Push-ups", category: "Chest", defaultSets: 3, defaultReps: 15 },
  { name: "Decline Bench Press", category: "Chest", defaultSets: 3, defaultReps: 10 },
  { name: "Dumbbell Flyes", category: "Chest", defaultSets: 3, defaultReps: 12 },
  { name: "Machine Chest Press", category: "Chest", defaultSets: 3, defaultReps: 10 },
  
  // Back
  { name: "Deadlift", category: "Back", defaultSets: 3, defaultReps: 5, imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop" },
  { name: "Pull-ups", category: "Back", defaultSets: 3, defaultReps: 10, imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=200&h=200&fit=crop" },
  { name: "Lat Pulldown", category: "Back", defaultSets: 3, defaultReps: 10 },
  { name: "Barbell Row", category: "Back", defaultSets: 3, defaultReps: 8 },
  { name: "Seated Cable Row", category: "Back", defaultSets: 3, defaultReps: 10 },
  { name: "T-Bar Row", category: "Back", defaultSets: 3, defaultReps: 8 },
  { name: "Single-Arm Dumbbell Row", category: "Back", defaultSets: 3, defaultReps: 10 },
  
  // Legs
  { name: "Squat", category: "Legs", defaultSets: 3, defaultReps: 8, imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop" },
  { name: "Leg Press", category: "Legs", defaultSets: 3, defaultReps: 10 },
  { name: "Romanian Deadlift (RDL)", category: "Legs", defaultSets: 3, defaultReps: 10 },
  { name: "Walking Lunges", category: "Legs", defaultSets: 3, defaultReps: 12 },
  { name: "Leg Extension", category: "Legs", defaultSets: 3, defaultReps: 12 },
  { name: "Lying Leg Curl", category: "Legs", defaultSets: 3, defaultReps: 12 },
  { name: "Standing Calf Raise", category: "Legs", defaultSets: 4, defaultReps: 15 },
  { name: "Bulgarian Split Squat", category: "Legs", defaultSets: 3, defaultReps: 8 },
  
  // Shoulders
  { name: "Overhead Press", category: "Shoulders", defaultSets: 3, defaultReps: 10, imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop" },
  { name: "Lateral Raise", category: "Shoulders", defaultSets: 3, defaultReps: 15 },
  { name: "Front Raise", category: "Shoulders", defaultSets: 3, defaultReps: 12 },
  { name: "Face Pulls", category: "Shoulders", defaultSets: 3, defaultReps: 15 },
  { name: "Seated Dumbbell Press", category: "Shoulders", defaultSets: 3, defaultReps: 10 },
  { name: "Reverse Pec Deck", category: "Shoulders", defaultSets: 3, defaultReps: 12 },
  { name: "Upright Row", category: "Shoulders", defaultSets: 3, defaultReps: 10 },
  
  // Arms
  { name: "Bicep Curls", category: "Arms", defaultSets: 3, defaultReps: 12, imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop" },
  { name: "Tricep Extension", category: "Arms", defaultSets: 3, defaultReps: 12, imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop" },
  { name: "Hammer Curls", category: "Arms", defaultSets: 3, defaultReps: 12 },
  { name: "Tricep Pushdown", category: "Arms", defaultSets: 3, defaultReps: 15 },
  { name: "Preacher Curl", category: "Arms", defaultSets: 3, defaultReps: 10 },
  { name: "Skull Crushers", category: "Arms", defaultSets: 3, defaultReps: 10 },
  { name: "Concentration Curl", category: "Arms", defaultSets: 3, defaultReps: 12 },
  
  // Core
  { name: "Crunches", category: "Core", defaultSets: 3, defaultReps: 20 },
  { name: "Plank", category: "Core", defaultSets: 3, defaultReps: 1 }, // 1 rep implies time-based usually
  { name: "Russian Twists", category: "Core", defaultSets: 3, defaultReps: 20 },
  { name: "Hanging Leg Raise", category: "Core", defaultSets: 3, defaultReps: 12 },
  { name: "Ab Wheel Rollout", category: "Core", defaultSets: 3, defaultReps: 10 },
  { name: "Bicycle Crunches", category: "Core", defaultSets: 3, defaultReps: 20 },
  
  // Cardio & Olympic
  { name: "Treadmill Run", category: "Cardio", defaultSets: 1, defaultReps: 1 },
  { name: "Rowing Machine", category: "Cardio", defaultSets: 1, defaultReps: 1 },
  { name: "Power Clean", category: "Olympic", defaultSets: 5, defaultReps: 3 },
  { name: "Snatch", category: "Olympic", defaultSets: 5, defaultReps: 3 },
];
