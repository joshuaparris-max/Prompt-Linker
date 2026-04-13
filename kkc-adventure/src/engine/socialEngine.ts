import Database from 'better-sqlite3';
import { PlayerState } from '../types';
import { getNPCsAtLocation } from './movement';
import {
  KILVIN_WORK_APPROVAL,
  KILVIN_WORK_DENIAL_UNFIT,
  KILVIN_WORK_DENIAL_NOT_HERE,
  KILVIN_WORK_ALREADY_APPROVED,
  KILVIN_WORK_SHIFT_COMPLETE,
  AMBROSE_IGNORE_LINES,
  AMBROSE_CAREFUL_RESPONSE_LINES,
  AMBROSE_SHARP_RESPONSE_LINES,
  AMBROSE_NOT_HERE_LINES,
} from '../content/authorityDialogue';

export function getNpcTrust(state: PlayerState, npc_id: string): number {
  return state.reputation.npc_trust[npc_id] ?? 50;
}

export function setNpcTrust(state: PlayerState, npc_id: string, value: number): PlayerState {
  const clamped = Math.max(0, Math.min(100, value));
  return {
    ...state,
    reputation: {
      ...state.reputation,
      npc_trust: {
        ...state.reputation.npc_trust,
        [npc_id]: clamped,
      },
    },
  };
}

export function adjustUniversitySocial(state: PlayerState, delta: number): PlayerState {
  const newVal = Math.max(0, Math.min(100, state.reputation.university_social + delta));
  return {
    ...state,
    reputation: {
      ...state.reputation,
      university_social: newVal,
    },
  };
}

export function askKilvinForWork(
  state: PlayerState,
  db: Database.Database,
): { message: string; newState: PlayerState } {
  const idx = state.day_number % 3;

  if (state.location_id !== 'university_fishery_outer') {
    return { message: KILVIN_WORK_DENIAL_NOT_HERE[idx], newState: state };
  }

  const npcs = getNPCsAtLocation(db, state.location_id);
  const kilvinPresent = npcs.some(n => n.id === 'kilvin');
  if (!kilvinPresent) {
    return { message: KILVIN_WORK_DENIAL_NOT_HERE[idx], newState: state };
  }

  const unfit = state.fatigue > 80 || state.warmth < 25 || state.injuries.length > 0;
  if (unfit) {
    const penalise = state.fatigue > 80 || state.warmth < 20 || state.injuries.length > 1;
    const newState = penalise
      ? setNpcTrust(state, 'kilvin', getNpcTrust(state, 'kilvin') - 1)
      : state;
    return { message: KILVIN_WORK_DENIAL_UNFIT[idx], newState };
  }

  if (state.fishery_state.approved_today) {
    return { message: KILVIN_WORK_ALREADY_APPROVED[idx], newState: state };
  }

  let newState: PlayerState = {
    ...state,
    fishery_state: {
      ...state.fishery_state,
      approved_today: true,
      last_approval_day: state.day_number,
    },
  };
  newState = setNpcTrust(newState, 'kilvin', getNpcTrust(newState, 'kilvin') + 2);

  return { message: KILVIN_WORK_APPROVAL[idx], newState };
}

export function workFishery(
  state: PlayerState,
  db: Database.Database,
): { message: string; newState: PlayerState } {
  const idx = state.day_number % 3;

  if (state.location_id !== 'university_fishery_outer') {
    return {
      message: "You need to be in the Fishery to work a shift.",
      newState: state,
    };
  }

  if (!state.fishery_state.approved_today) {
    return {
      message: "Kilvin hasn't approved you for a shift today. Ask him first.",
      newState: state,
    };
  }

  const PAY_PER_SHIFT = 12;

  const newState: PlayerState = {
    ...state,
    money_drabs: state.money_drabs + PAY_PER_SHIFT,
    fatigue: Math.min(100, state.fatigue + 15),
    fishery_state: {
      ...state.fishery_state,
      shifts_completed_today: state.fishery_state.shifts_completed_today + 1,
    },
  };

  return { message: KILVIN_WORK_SHIFT_COMPLETE[idx], newState };
}

type AmbroseResponse = 'ignore' | 'careful' | 'sharp';

export function respondToAmbrose(
  response: AmbroseResponse,
  state: PlayerState,
  db: Database.Database,
): { message: string; newState: PlayerState } {
  const idx = state.day_number % 3;

  const npcs = getNPCsAtLocation(db, state.location_id);
  const ambrosePresent = npcs.some(n => n.id === 'ambrose');

  if (!ambrosePresent) {
    return { message: AMBROSE_NOT_HERE_LINES[idx], newState: state };
  }

  switch (response) {
    case 'ignore': {
      let newState = adjustUniversitySocial(state, -1);
      newState = setNpcTrust(newState, 'ambrose', getNpcTrust(newState, 'ambrose') - 2);
      return { message: AMBROSE_IGNORE_LINES[idx], newState };
    }
    case 'careful': {
      let newState = adjustUniversitySocial(state, 1);
      newState = setNpcTrust(newState, 'ambrose', getNpcTrust(newState, 'ambrose') + 1);
      return { message: AMBROSE_CAREFUL_RESPONSE_LINES[idx], newState };
    }
    case 'sharp': {
      let newState = adjustUniversitySocial(state, -2);
      newState = setNpcTrust(newState, 'ambrose', getNpcTrust(newState, 'ambrose') - 3);
      return { message: AMBROSE_SHARP_RESPONSE_LINES[idx], newState };
    }
  }
}
