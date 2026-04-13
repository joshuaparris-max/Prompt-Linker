import { PlayerState } from '../types';
import { advanceTime } from './time';

const BUSK_MESSAGES = [
  'You play for two hours. The crowd is sparse but attentive. People leave coins on the edge of the bar.',
  'You settle into a set and let the music find its own pace. When you finish, you count what was left.',
  'Your fingers find the old patterns easily enough. The room listens. The coins accumulate.',
];

export function eat(state: PlayerState): { newState: PlayerState; message: string } {
  const MEAL_COST = 3;
  if (state.money_drabs < MEAL_COST) {
    return {
      newState: state,
      message: "You haven't the coin for even a modest meal.",
    };
  }

  const newState: PlayerState = {
    ...state,
    money_drabs: state.money_drabs - MEAL_COST,
    hunger: Math.max(0, state.hunger - 40),
  };

  return {
    newState,
    message: 'You eat something plain and filling. The edge comes off your hunger.',
  };
}

export function sleep(state: PlayerState): { newState: PlayerState; message: string } {
  const ANKERS_COST = 20;

  const validLocations = ['university_ankers', 'university_mews_room'];
  if (!validLocations.includes(state.location_id)) {
    return { newState: state, message: 'You need somewhere to actually sleep.' };
  }

  if (state.location_id === 'university_ankers') {
    if (state.money_drabs < ANKERS_COST) {
      return { newState: state, message: "You can't afford the room tonight." };
    }
  }

  const cost = state.location_id === 'university_ankers' ? ANKERS_COST : 0;

  // Advance two steps (night -> morning equivalent)
  let advanced = advanceTime(state, 2);

  const newSympathyState = {
    ...advanced.sympathy_state,
    alar_strength: Math.max(80, advanced.sympathy_state.alar_strength),
    warmth: Math.max(75, advanced.sympathy_state.warmth),
    times_used_today: 0,
  };

  const newState: PlayerState = {
    ...advanced,
    money_drabs: advanced.money_drabs - cost,
    fatigue: 0,
    hunger: Math.max(0, advanced.hunger - 20),
    warmth: Math.max(75, advanced.warmth),
    sympathy_state: newSympathyState,
    fishery_state: {
      ...advanced.fishery_state,
      approved_today: false,
      shifts_completed_today: 0,
    },
    eolian_state: {
      ...advanced.eolian_state,
      performances_today: 0,
    },
  };

  return {
    newState,
    message: 'You sleep and wake to a grey morning. The weariness is gone, at least for now.',
  };
}

export function busk(state: PlayerState): { newState: PlayerState; message: string } {
  if (state.location_id !== 'university_ankers') {
    return { newState: state, message: "There's nowhere to play for coin here." };
  }

  let earnings = 5;
  if (state.reputation.eolian_standing >= 40) earnings += 3;
  if (state.reputation.university_social >= 50) earnings += 2;
  if (state.fatigue >= 60) earnings -= 2;
  if (state.hunger >= 70) earnings -= 1;
  earnings = Math.max(1, earnings);

  const msgIndex = state.day_number % 3;
  const baseMessage = BUSK_MESSAGES[msgIndex];

  const advanced = advanceTime(state, 1);

  const newState: PlayerState = {
    ...advanced,
    money_drabs: advanced.money_drabs + earnings,
    reputation: {
      ...advanced.reputation,
      eolian_standing: Math.min(100, advanced.reputation.eolian_standing + 1),
    },
  };

  return {
    newState,
    message: `${baseMessage} ${earnings} drabs in all.`,
  };
}

export function checkTuitionDeadline(state: PlayerState): PlayerState {
  if (
    state.day_number >= state.tuition_state.due_on_day &&
    !state.tuition_state.paid &&
    !state.tuition_state.overdue
  ) {
    return {
      ...state,
      tuition_state: { ...state.tuition_state, overdue: true },
    };
  }
  return state;
}

export function payTuition(state: PlayerState): { newState: PlayerState; message: string } {
  if (state.tuition_state.paid) {
    return { newState: state, message: 'Your tuition is already settled.' };
  }
  if (state.money_drabs < state.tuition_state.amount_drabs) {
    return { newState: state, message: "You don't have enough." };
  }

  const newState: PlayerState = {
    ...state,
    money_drabs: state.money_drabs - state.tuition_state.amount_drabs,
    tuition_state: { ...state.tuition_state, paid: true },
  };

  return { newState, message: 'You pay your tuition. The weight of it leaves you.' };
}
