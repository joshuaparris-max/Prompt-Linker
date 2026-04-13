import { PlayerState, TimeOfDay } from '../types';

const TIME_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];

export function advanceTime(state: PlayerState, steps: number = 1): PlayerState {
  let current = { ...state };

  for (let i = 0; i < steps; i++) {
    const idx = TIME_ORDER.indexOf(current.time_of_day);
    const nextIdx = (idx + 1) % TIME_ORDER.length;
    const nextTime = TIME_ORDER[nextIdx];

    const newDayNumber = nextTime === 'morning' ? current.day_number + 1 : current.day_number;

    // Hunger and fatigue rise each step
    const newHunger = Math.min(100, current.hunger + 8);
    const newFatigue = Math.min(100, current.fatigue + 6);

    // Sympathy recovery
    const timesUsed = current.sympathy_state.times_used_today;
    const warmthRecovery = timesUsed === 0 ? 3 : 1;
    const newSympathyWarmth = Math.min(100, current.sympathy_state.warmth + warmthRecovery);
    const newAlarStrength = Math.min(100, current.sympathy_state.alar_strength + 4);

    // Reset fishery approval if day changes
    let newFisheryState = current.fishery_state;
    if (nextTime === 'morning' && newDayNumber !== current.day_number) {
      newFisheryState = {
        ...current.fishery_state,
        approved_today: false,
        shifts_completed_today: 0,
      };
    }

    // Reset eolian performances if day changes
    let newEolianState = current.eolian_state;
    if (nextTime === 'morning' && newDayNumber !== current.day_number) {
      newEolianState = {
        ...current.eolian_state,
        performances_today: 0,
      };
    }

    current = {
      ...current,
      time_of_day: nextTime,
      day_number: newDayNumber,
      hunger: newHunger,
      fatigue: newFatigue,
      warmth: Math.min(100, current.warmth + warmthRecovery),
      sympathy_state: {
        ...current.sympathy_state,
        warmth: newSympathyWarmth,
        alar_strength: newAlarStrength,
      },
      fishery_state: newFisheryState,
      eolian_state: newEolianState,
    };
  }

  return current;
}

export function timeLabel(time: TimeOfDay): string {
  switch (time) {
    case 'morning': return 'the early morning';
    case 'afternoon': return 'the afternoon';
    case 'evening': return 'the evening';
    case 'night': return 'deep in the night';
  }
}
