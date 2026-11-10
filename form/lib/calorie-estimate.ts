export type CalorieEstimateInput = {
  weightKg: number;
  weightToLoseKg: number;
  maintenanceKcal: number;
  days: number;
};

export type CalorieEstimate = {
  pounds: number;
  weeklyLossKg: number;
  weeklyLossPercent: number;
  dailyDeficit: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  feasible: boolean;
  reason: string;
  estimatedDaysAtRecommendedPace: number;
};

const KG_TO_LB = 2.2046226218;

/**
 * Simple planning estimate. Protein and fat targets use the requested
 * 0.6 g/lb and 0.3 g/lb formulas; remaining calories are assigned to carbs.
 */
export function estimateCaloriesAndMacros(input: CalorieEstimateInput): CalorieEstimate | null {
  const { weightKg, weightToLoseKg, maintenanceKcal, days } = input;
  if (![weightKg, weightToLoseKg, maintenanceKcal, days].every(Number.isFinite) ||
      weightKg <= 0 || weightToLoseKg <= 0 || weightToLoseKg >= weightKg ||
      maintenanceKcal <= 0 || days <= 0) return null;

  const pounds = weightKg * KG_TO_LB;
  const dailyDeficit = (weightToLoseKg * 7700) / days;
  const calories = Math.round(maintenanceKcal - dailyDeficit);
  const protein = Math.round(pounds * 0.6);
  const fat = Math.round(pounds * 0.3);
  const carbs = Math.floor((calories - protein * 4 - fat * 9) / 4);
  const weeklyLossKg = weightToLoseKg * 7 / (days / 1);
  const weeklyLossPercent = weeklyLossKg / weightKg * 100;
  const maxRecommendedWeeklyKg = Math.min(0.9, weightKg * 0.01);
  const estimatedDaysAtRecommendedPace = Math.ceil(weightToLoseKg / maxRecommendedWeeklyKg * 7);

  let reason = 'The requested pace is within the calculator’s gradual-loss planning range.';
  if (calories <= 0) reason = 'The required daily deficit is at least as large as estimated maintenance, leaving no positive calorie target.';
  else if (carbs < 0) reason = 'The calorie target cannot cover the requested protein and fat targets, so there is no room left for carbohydrates.';
  else if (weeklyLossKg > maxRecommendedWeeklyKg) reason = `This timeline requires about ${weeklyLossKg.toFixed(2)} kg/week (${weeklyLossPercent.toFixed(1)}% of starting weight weekly), above this calculator’s gradual planning pace. At the same pace, allow about ${Math.ceil(estimatedDaysAtRecommendedPace / 7)} weeks.`;

  return {
    pounds,
    weeklyLossKg,
    weeklyLossPercent,
    dailyDeficit: Math.round(dailyDeficit),
    calories: Math.max(0, calories),
    protein,
    fat,
    carbs: Math.max(0, carbs),
    feasible: calories > 0 && carbs >= 0 && weeklyLossKg <= maxRecommendedWeeklyKg,
    reason,
    estimatedDaysAtRecommendedPace,
  };
}
