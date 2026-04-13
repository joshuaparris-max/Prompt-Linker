import Database from 'better-sqlite3';
import { PlayerState } from '../types';

interface PlayerStateRow {
  id: number;
  character_id: string;
  era: string;
  location_id: string;
  money_drabs: number;
  inventory: string;
  reputation: string;
  time_of_day: string;
  day_number: number;
  term_number: number;
  injuries: string;
  hunger: number;
  fatigue: number;
  warmth: number;
  academic_rank: string;
  world_state_flags: string;
  tuition_state: string;
  sympathy_state: string;
  fishery_state: string;
  eolian_state: string;
}

export function loadPlayerState(db: Database.Database): PlayerState | null {
  const row = db.prepare('SELECT * FROM player_state WHERE id = 1').get() as PlayerStateRow | undefined;
  if (!row) return null;

  return {
    character_id: row.character_id,
    era: row.era,
    location_id: row.location_id,
    money_drabs: row.money_drabs,
    inventory: JSON.parse(row.inventory),
    reputation: JSON.parse(row.reputation),
    time_of_day: row.time_of_day as PlayerState['time_of_day'],
    day_number: row.day_number,
    term_number: row.term_number,
    injuries: JSON.parse(row.injuries),
    hunger: row.hunger,
    fatigue: row.fatigue,
    warmth: row.warmth,
    academic_rank: row.academic_rank as PlayerState['academic_rank'],
    world_state_flags: JSON.parse(row.world_state_flags),
    tuition_state: JSON.parse(row.tuition_state),
    sympathy_state: JSON.parse(row.sympathy_state),
    fishery_state: JSON.parse(row.fishery_state),
    eolian_state: JSON.parse(row.eolian_state),
  };
}

export function savePlayerState(db: Database.Database, state: PlayerState): void {
  db.prepare(`
    INSERT INTO player_state
      (id, character_id, era, location_id, money_drabs, inventory, reputation,
       time_of_day, day_number, term_number, injuries, hunger, fatigue, warmth,
       academic_rank, world_state_flags, tuition_state, sympathy_state, fishery_state, eolian_state)
    VALUES
      (1, @character_id, @era, @location_id, @money_drabs, @inventory, @reputation,
       @time_of_day, @day_number, @term_number, @injuries, @hunger, @fatigue, @warmth,
       @academic_rank, @world_state_flags, @tuition_state, @sympathy_state, @fishery_state, @eolian_state)
    ON CONFLICT(id) DO UPDATE SET
      character_id = excluded.character_id,
      era = excluded.era,
      location_id = excluded.location_id,
      money_drabs = excluded.money_drabs,
      inventory = excluded.inventory,
      reputation = excluded.reputation,
      time_of_day = excluded.time_of_day,
      day_number = excluded.day_number,
      term_number = excluded.term_number,
      injuries = excluded.injuries,
      hunger = excluded.hunger,
      fatigue = excluded.fatigue,
      warmth = excluded.warmth,
      academic_rank = excluded.academic_rank,
      world_state_flags = excluded.world_state_flags,
      tuition_state = excluded.tuition_state,
      sympathy_state = excluded.sympathy_state,
      fishery_state = excluded.fishery_state,
      eolian_state = excluded.eolian_state
  `).run({
    character_id: state.character_id,
    era: state.era,
    location_id: state.location_id,
    money_drabs: state.money_drabs,
    inventory: JSON.stringify(state.inventory),
    reputation: JSON.stringify(state.reputation),
    time_of_day: state.time_of_day,
    day_number: state.day_number,
    term_number: state.term_number,
    injuries: JSON.stringify(state.injuries),
    hunger: state.hunger,
    fatigue: state.fatigue,
    warmth: state.warmth,
    academic_rank: state.academic_rank,
    world_state_flags: JSON.stringify(state.world_state_flags),
    tuition_state: JSON.stringify(state.tuition_state),
    sympathy_state: JSON.stringify(state.sympathy_state),
    fishery_state: JSON.stringify(state.fishery_state),
    eolian_state: JSON.stringify(state.eolian_state),
  });
}

export function initDefaultPlayerState(): PlayerState {
  return {
    character_id: 'kvothe',
    era: 'university',
    location_id: 'university_mews_room',
    money_drabs: 300,
    inventory: [
      { id: 'lute', name: "Kvothe's lute", quantity: 1, notes: 'Old but well-kept. Handle carefully.' },
      { id: 'candle_tallow', name: 'tallow candle', quantity: 3, notes: 'Basic sympathetic binding material.' },
      { id: 'wicking', name: 'wicking cord', quantity: 1, notes: 'For use in sympathy preparations.' },
    ],
    reputation: {
      academic_standing: 50,
      university_social: 40,
      eolian_standing: 30,
      npc_trust: {
        simmon: 60,
        wilem: 55,
        anker: 50,
        kilvin: 45,
        ambrose: 20,
      },
    },
    time_of_day: 'morning',
    day_number: 1,
    term_number: 1,
    injuries: [],
    hunger: 10,
    fatigue: 10,
    warmth: 80,
    academic_rank: 'E_lir',
    world_state_flags: {},
    tuition_state: {
      amount_drabs: 30,
      due_on_day: 14,
      paid: false,
      overdue: false,
    },
    sympathy_state: {
      alar_strength: 60,
      warmth: 80,
      active_bindings: 0,
      times_used_today: 0,
    },
    fishery_state: {
      approved_today: false,
      shifts_completed_today: 0,
      last_approval_day: null,
    },
    eolian_state: {
      has_talent_pipes: false,
      last_audition_day: null,
      performances_today: 0,
    },
  };
}
