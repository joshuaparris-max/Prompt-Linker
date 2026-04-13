import Database from 'better-sqlite3';
import { parseNPCCommand, isNPCPresent, talkToNPC } from '../src/engine/npcEngine';
import { initDefaultPlayerState } from '../src/engine/state';
import { runMigrations } from '../src/db/schema';
import { runSeed } from '../src/db/seed';
import { NPC } from '../src/types';

let db: Database.Database;

beforeAll(() => {
  db = new Database(':memory:');
  runMigrations(db);
  runSeed(db);
});

afterAll(() => {
  db.close();
});

describe('parseNPCCommand', () => {
  test('"talk to simmon" returns { npc_id: "simmon", topic: null }', () => {
    expect(parseNPCCommand('talk to simmon')).toEqual({ npc_id: 'simmon', topic: null });
  });

  test('"ask wilem about classes" returns { npc_id: "wilem", topic: "classes" }', () => {
    expect(parseNPCCommand('ask wilem about classes')).toEqual({ npc_id: 'wilem', topic: 'classes' });
  });

  test('"look around" returns null', () => {
    expect(parseNPCCommand('look around')).toBeNull();
  });
});

describe('isNPCPresent', () => {
  test('returns true when npc.location_id matches state.location_id', () => {
    const npc: NPC = {
      id: 'simmon',
      name: 'Simmon',
      location_id: 'university_ankers',
      era: 'university',
      temperament: '',
      speech_style: '',
    };
    const state = { ...initDefaultPlayerState(), location_id: 'university_ankers' };
    expect(isNPCPresent(npc, state)).toBe(true);
  });

  test('returns false when locations differ', () => {
    const npc: NPC = {
      id: 'simmon',
      name: 'Simmon',
      location_id: 'university_ankers',
      era: 'university',
      temperament: '',
      speech_style: '',
    };
    const state = { ...initDefaultPlayerState(), location_id: 'university_mains' };
    expect(isNPCPresent(npc, state)).toBe(false);
  });
});

describe('talkToNPC', () => {
  test('talkToNPC simmon at university_ankers returns non-empty string', () => {
    const state = { ...initDefaultPlayerState(), location_id: 'university_ankers' };
    const result = talkToNPC('simmon', null, state, db);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('talkToNPC simmon when player is at university_mains returns "not here" message', () => {
    const state = { ...initDefaultPlayerState(), location_id: 'university_mains' };
    const result = talkToNPC('simmon', null, state, db);
    expect(result.toLowerCase()).toContain("isn't here");
  });
});
