/**
 * Professional Muscle Group Color Mapping
 * Based on industry standards used in high-performance fitness tracking software (e.g., Hevy, Fitbod, Strong).
 * Colors are chosen for high contrast, instant functional identification, and anatomical group mapping.
 */
export const getCategoryColor = (category?: string) => {
  const cat = category?.toLowerCase() || '';
  
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    // Primary Push (Chest) - Red represents explosive power and high-intensity push.
    chest: { bg: '#dc2626', text: '#ffffff', border: '#b91c1c' },
    
    // Primary Pull (Back) - Blue represents stability, multi-joint pull, and foundational strength.
    back: { bg: '#2563eb', text: '#ffffff', border: '#1d4ed8' },
    
    // Primary Lower Body (Legs) - Green represents the foundation, growth, and the body's grounding muscle groups.
    legs: { bg: '#16a34a', text: '#ffffff', border: '#15803d' },
    
    // Secondary Push (Shoulders) - Orange represents range of motion, secondary power, and shoulder stability.
    shoulders: { bg: '#ea580c', text: '#ffffff', border: '#c2410c' },
    
    // Isolation / Precision (Arms) - Purple signifies isolation, skill-based movement, and finesse.
    arms: { bg: '#9333ea', text: '#ffffff', border: '#7e22ce' },
    
    // Functional Stability (Core) - Cyan represent internal balance, functional central health, and core stability.
    core: { bg: '#0891b2', text: '#ffffff', border: '#0e7490' },
    
    // Aerobic / Heart Health (Cardio) - Rose/Pink represents intensity, heat, and cardiovascular endurance.
    cardio: { bg: '#db2777', text: '#ffffff', border: '#be185d' },
  };

  // Default Fallback (Grey) - Neutral representation for miscellaneous or uncategorized exercises.
  return colors[cat] || { bg: '#4b5563', text: '#ffffff', border: '#374151' };
};
