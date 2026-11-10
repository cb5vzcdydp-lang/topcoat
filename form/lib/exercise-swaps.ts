import {availableAtGym, movementFamily} from './movement-families';
import {muscleAssignment} from './muscle-assignments';
import type {Exercise} from './domain';

export type SwapSource = Pick<Exercise,'id'|'name'|'muscle'> & Partial<Pick<Exercise,'primaryMuscles'|'secondaryMuscles'|'muscleOverride'>>;
export type SwapCandidate = Exercise & {requiredEquipment?: string[]};

/** Suggestions are browsing aids, never automatic substitutions or strength equivalents. */
export function suggestExerciseSwaps(
  current: SwapSource,
  candidates: SwapCandidate[],
  options: {selected?: string[]; availableEquipment?: string[]; preferred?: string; limit?: number} = {},
) {
  const direct = new Set<Exercise['muscle']>(muscleAssignment(current).direct.filter(m => m !== 'Other'));
  const family = movementFamily(current.name);
  const preferred = new Set((options.preferred || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
  const excluded = new Set([current.id, ...(options.selected || [])]);
  const seen = new Set<string>();
  return candidates.flatMap(exercise => {
    if (excluded.has(exercise.id) || exercise.name.toLowerCase() === current.name.toLowerCase() || seen.has(exercise.id)) return [];
    seen.add(exercise.id);
    if (options.availableEquipment && !availableAtGym(exercise.requiredEquipment || [exercise.equipment], options.availableEquipment, exercise.equipment === 'bodyweight')) return [];
    const saved = preferred.has(exercise.name.toLowerCase());
    const overlap = muscleAssignment(exercise).direct.filter(m => direct.has(m)).length;
    const sameMovement = family !== 'Other / unclassified' && movementFamily(exercise.name) === family;
    if (!saved && (!overlap || !sameMovement)) return [];
    return [{exercise, reason: saved ? 'Your preferred alternative' : 'Similar movement and direct muscles', score: (saved ? 100 : 0) + overlap * 10 + Number(sameMovement) * 5}];
  }).sort((a,b) => b.score-a.score || a.exercise.name.localeCompare(b.exercise.name)).slice(0, options.limit ?? 6);
}
