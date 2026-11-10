/**
 * Casual mode is a simpler view of the same product. Every tab listed here
 * must also render and remain functional in Science-Based mode.
 */
export const CASUAL_FEATURE_TABS = [
  "Home",
  "Calories",
  "Training",
  "Social",
  "Touch grass",
  "Sleep + cardio",
  "Calorie calculator",
  "Progress",
  "AI coach",
  "Workout from video",
  "Body comp",
] as const;

export type CasualFeatureTab = (typeof CASUAL_FEATURE_TABS)[number];
