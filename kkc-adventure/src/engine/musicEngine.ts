import Database from 'better-sqlite3';
import { PlayerState } from '../types';
import {
  EOLIAN_AUDITION_BLOCKED,
  EOLIAN_AUDITION_FAIL,
  EOLIAN_AUDITION_SUCCESS,
  EOLIAN_PLAY_LINES,
  EOLIAN_NOT_OPEN_LINES,
} from '../content/eolianDialogue';

export function canEnterEolian(state: PlayerState): boolean {
  return state.time_of_day === 'evening' || state.time_of_day === 'night';
}

export function calculateAuditionScore(state: PlayerState): number {
  const hasLute = state.inventory.some(i => i.id === 'lute' && i.quantity > 0);
  if (!hasLute) return 0;

  let score = 35 + 15; // base + lute

  if (state.reputation.eolian_standing >= 40) score += 10;
  else if (state.reputation.eolian_standing >= 30) score += 5;

  if (state.reputation.university_social >= 50) score += 3;

  if (state.fatigue >= 70) score -= 15;
  else if (state.fatigue >= 40) score -= 5;

  if (state.hunger >= 70) score -= 10;
  else if (state.hunger >= 40) score -= 4;

  if (state.warmth < 40) score -= 5;
  if (state.injuries.length > 0) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function auditionForPipes(
  state: PlayerState,
  db: Database.Database,
): { message: string; newState: PlayerState } {
  const idx = state.day_number % 3;

  if (state.location_id !== 'eolian_floor') {
    return { message: EOLIAN_AUDITION_BLOCKED[idx], newState: state };
  }

  if (!canEnterEolian(state)) {
    return { message: EOLIAN_NOT_OPEN_LINES[idx], newState: state };
  }

  if (state.eolian_state.has_talent_pipes) {
    return { message: EOLIAN_AUDITION_BLOCKED[idx], newState: state };
  }

  const lastAudition = state.eolian_state.last_audition_day;
  if (lastAudition !== null && lastAudition === state.day_number) {
    return { message: EOLIAN_AUDITION_BLOCKED[idx], newState: state };
  }

  const hasLute = state.inventory.some(i => i.id === 'lute' && i.quantity > 0);
  if (!hasLute) {
    return { message: EOLIAN_AUDITION_BLOCKED[idx], newState: state };
  }

  const score = calculateAuditionScore(state);
  const PASS_THRESHOLD = 50;

  const newEolianState = {
    ...state.eolian_state,
    last_audition_day: state.day_number,
  };

  if (score >= PASS_THRESHOLD) {
    const newState: PlayerState = {
      ...state,
      eolian_state: {
        ...newEolianState,
        has_talent_pipes: true,
      },
      reputation: {
        ...state.reputation,
        eolian_standing: Math.min(100, state.reputation.eolian_standing + 15),
        university_social: Math.min(100, state.reputation.university_social + 5),
      },
    };
    return { message: EOLIAN_AUDITION_SUCCESS[idx], newState };
  }

  const newState: PlayerState = {
    ...state,
    eolian_state: newEolianState,
    reputation: {
      ...state.reputation,
      eolian_standing: Math.min(100, state.reputation.eolian_standing + 2),
    },
  };

  return { message: EOLIAN_AUDITION_FAIL[idx], newState };
}

export function playAtEolian(
  state: PlayerState,
  _db: Database.Database,
): { message: string; newState: PlayerState } {
  const idx = state.day_number % 3;

  if (state.location_id !== 'eolian_floor') {
    return { message: EOLIAN_NOT_OPEN_LINES[idx], newState: state };
  }

  if (!canEnterEolian(state)) {
    return { message: EOLIAN_NOT_OPEN_LINES[idx], newState: state };
  }

  if (!state.eolian_state.has_talent_pipes) {
    return {
      message: "You have not earned the talent pipes. The Eolian does not give its stage freely.",
      newState: state,
    };
  }

  const MAX_PERFORMANCES = 2;
  if (state.eolian_state.performances_today >= MAX_PERFORMANCES) {
    return {
      message: "You have played enough for tonight. The audience has given what it had.",
      newState: state,
    };
  }

  const newState: PlayerState = {
    ...state,
    eolian_state: {
      ...state.eolian_state,
      performances_today: state.eolian_state.performances_today + 1,
    },
    reputation: {
      ...state.reputation,
      eolian_standing: Math.min(100, state.reputation.eolian_standing + 3),
      university_social: Math.min(100, state.reputation.university_social + 2),
    },
  };

  return { message: EOLIAN_PLAY_LINES[idx], newState };
}
