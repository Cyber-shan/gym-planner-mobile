/**
 * Strips hardcoded units (kg, lbs, etc.) from a weight string,
 * returns the clean numeric value or 'Bodyweight'.
 */
export const stripUnit = (weight: string | undefined): string => {
  if (!weight) return "";
  if (weight.toLowerCase() === 'bodyweight') return 'Bodyweight';
  // Remove common unit strings and extra spaces
  return weight.replace(/(kg|lb|lbs|kg)/gi, "").trim();
};
