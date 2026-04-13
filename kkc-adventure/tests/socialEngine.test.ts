import Database from 'better-sqlite3';
import {
  getNpcTrust,
  setNpcTrust,
  adjustUniversitySocial,
  askKilvinForWork,
  workFishery,
  respondToAmbrose,
} from '../src/engine/socialEngine';
import { initDefaultPlayerState } from '../src/engine/state';
import { runMigrations } from '../src/db/schema';
import { runSeed } from '../src/db/seed';

let db: Database.Database;

beforeAll(() => {
  db = new Database(':memory:');
  runMigrations(db);
  runSeed(db);
});

afterAll(() => {
  db.close();
});

describe('getNpcTrust', () => {
  test('returns trust value when present', () => {
    const state = initDefaultPlayerState();
    expect(getNpcTrust(state, 'kilvin')).toBe(45);
  });

  test('returns 50 for unknown npc', () => {
    const state = initDefaultPlayerState();
    expect(getNpcTrust(state, 'unknown_npc')).toBe(50);
  });
});

describe('setNpcTrust', () => {
  test('clamps value to 0-100', () => {
    const state = initDefaultPlayerState();
    const clamped = setNpcTrust(state, 'kilvin', 150);
    expect(getNpcTrust(clamped, 'kilvin')).toBe(100);

    const clamped2 = setNpcTrust(state, 'kilvin', -10);
    expect(getNpcTrust(clamped2, 'kilvin')).toBe(0);
  });
});

describe('adjustUniversitySocial', () => {
  test('adjusts university social within 0-100', () => {
    const state = initDefaultPlayerState();
    const up = adjustUniversitySocial(state, 20);
    expect(up.reputation.university_social).toBe(60);

    const down = adjustUniversitySocial(state, -50);
    expect(down.reputation.university_social).toBe(0);
  });
});

describe('askKilvinForWork', () => {
  test('returns denial when not at fishery', () => {
    const state = { ...initDefaultPlayerState(), location_id: 'university_mains' };
    const { message, newState } = askKilvinForWork(state, db);
    expect(message).toBeTruthy();
    expect(newState.fishery_state.approved_today).toBe(false);
  });

  test('approves work when at fishery and fit', () => {
    const state = {
      ...initDefaultPlayerState(),
      location_id: 'university_fishery_outer',
      fatigue: 30,
      warmth: 70,
      injuries: [],
    };
    const { message, newState } = askKilvinForWork(state, db);
    expect(newState.fishery_state.approved_today).toBe(true);
    expect(message).toBeTruthy();
  });

  test('denies work when player is exhausted', () => {
    const state = {
      ...initDefaultPlayerState(),
      location_id: 'university_fishery_outer',
      fatigue: 90,
    };
    const { message, newState } = askKilvinForWork(state, db);
    expect(newState.fishery_state.approved_today).toBe(false);
    expect(message).toBeTruthy();
  });
});

describe('respondToAmbrose', () => {
  test('ignore reduces university social slightly', () => {
    const state = {
      ...initDefaultPlayerState(),
      location_id: 'university_archives_exterior',
    };
    const before = state.reputation.university_social;
    const { newState } = respondToAmbrose('ignore', state, db);
    expect(newState.reputation.university_social).toBeLessThan(before);
  });

  test('careful answer increases university social', () => {
    const state = {
      ...initDefaultPlayerState(),
      location_id: 'university_archives_exterior',
    };
    const before = state.reputation.university_social;
    const { newState } = respondToAmbrose('careful', state, db);
    expect(newState.reputation.university_social).toBeGreaterThan(before);
  });

  test('returns not-here message when ambrose absent', () => {
    const state = {
      ...initDefaultPlayerState(),
      location_id: 'university_mains',
    };
    const { message } = respondToAmbrose('ignore', state, db);
    expect(message.toLowerCase()).toContain('not');
  });
});
