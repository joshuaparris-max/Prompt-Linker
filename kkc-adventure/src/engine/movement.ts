import Database from 'better-sqlite3';
import { Exit, Location, NPC, PlayerState } from '../types';

interface LocationRow {
  id: string;
  name: string;
  era: string;
  tier: number;
  cluster_id: string;
  description_base: string;
  exits: string;
  is_accessible: number;
  travel_time_minutes: number;
  canon_source?: string;
}

interface NPCRow {
  id: string;
  name: string;
  location_id: string;
  era: string;
  temperament: string;
  speech_style: string;
  conditions?: string;
}

export function getLocation(db: Database.Database, id: string): Location | null {
  const row = db.prepare('SELECT * FROM locations WHERE id = ?').get(id) as LocationRow | undefined;
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    era: row.era,
    tier: row.tier as Location['tier'],
    cluster_id: row.cluster_id,
    description_base: row.description_base,
    exits: JSON.parse(row.exits) as Exit[],
    is_accessible: row.is_accessible === 1,
    travel_time_minutes: row.travel_time_minutes,
    canon_source: row.canon_source,
  };
}

export function getAllLocations(db: Database.Database): Location[] {
  const rows = db.prepare('SELECT * FROM locations').all() as LocationRow[];
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    era: row.era,
    tier: row.tier as Location['tier'],
    cluster_id: row.cluster_id,
    description_base: row.description_base,
    exits: JSON.parse(row.exits) as Exit[],
    is_accessible: row.is_accessible === 1,
    travel_time_minutes: row.travel_time_minutes,
    canon_source: row.canon_source,
  }));
}

export function getNPCsAtLocation(db: Database.Database, location_id: string): NPC[] {
  const rows = db.prepare('SELECT * FROM npcs WHERE location_id = ?').all(location_id) as NPCRow[];
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    location_id: row.location_id,
    era: row.era,
    temperament: row.temperament,
    speech_style: row.speech_style,
    conditions: row.conditions,
  }));
}

export function getAccessibleExits(location: Location, state: PlayerState): Exit[] {
  return location.exits.filter(exit => {
    if (!exit.access_condition) return true;
    if (exit.access_condition === 'requires_Re_lar') {
      return state.academic_rank === 'Re_lar' || state.academic_rank === 'El_the';
    }
    if (exit.access_condition === 'locked_at_night') {
      return state.time_of_day !== 'night';
    }
    if (exit.access_condition === 'open_evening') {
      return state.time_of_day === 'evening' || state.time_of_day === 'night';
    }
    return true;
  });
}

export function movePlayer(
  db: Database.Database,
  state: PlayerState,
  direction: string,
): { success: boolean; newState: PlayerState; message: string } {
  const location = getLocation(db, state.location_id);
  if (!location) {
    return { success: false, newState: state, message: 'You cannot go that way.' };
  }

  const dirLower = direction.toLowerCase();
  const exit = location.exits.find(e => e.direction.toLowerCase() === dirLower);

  if (!exit) {
    return { success: false, newState: state, message: 'You cannot go that way.' };
  }

  if (exit.access_condition === 'requires_Re_lar') {
    if (state.academic_rank !== 'Re_lar' && state.academic_rank !== 'El_the') {
      return {
        success: false,
        newState: state,
        message: "The Stacks are closed to you. Only a Re'lar may enter the Archives unescorted.",
      };
    }
  }

  if (exit.access_condition === 'locked_at_night') {
    if (state.time_of_day === 'night') {
      return { success: false, newState: state, message: 'That way is shut for the night.' };
    }
  }

  if (exit.access_condition === 'open_evening') {
    if (state.time_of_day !== 'evening' && state.time_of_day !== 'night') {
      return {
        success: false,
        newState: state,
        message: "The Eolian doesn't open until evening.",
      };
    }
  }

  const newState: PlayerState = { ...state, location_id: exit.target_location_id };
  return { success: true, newState, message: '' };
}
