import Database from 'better-sqlite3';
import { canEnterEolian, calculateAuditionScore, auditionForPipes, playAtEolian } from '../src/engine/musicEngine';
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

describe('canEnterEolian', () => {
  test('returns true for evening', () => {
    const state = { ...initDefaultPlayerState(), time_of_day: 'evening' as const };
    expect(canEnterEolian(state)).toBe(true);
  });

  test('returns true for night', () => {
    const state = { ...initDefaultPlayerState(), time_of_day: 'night' as const };
    expect(canEnterEolian(state)).toBe(true);
  });

  test('returns false for morning', () => {
    const state = { ...initDefaultPlayerState(), time_of_day: 'morning' as const };
    expect(canEnterEolian(state)).toBe(false);
  });
});

describe('calculateAuditionScore', () => {
  test('returns 0 without a lute', () => {
    const state = { ...initDefaultPlayerState(), inventory: [] };
    expect(calculateAuditionScore(state)).toBe(0);
  });

  test('returns positive score with lute and healthy state', () => {
    const state = initDefaultPlayerState();
    const score = calculateAuditionScore(state);
    expect(score).toBeGreaterThan(0);
  });

  test('high fatigue reduces score', () => {
    const healthy = initDefaultPlayerState();
    const tired = { ...initDefaultPlayerState(), fatigue: 80 };
    expect(calculateAuditionScore(tired)).toBeLessThan(calculateAuditionScore(healthy));
  });
});

describe('auditionForPipes', () => {
  test('blocked when not at eolian floor', () => {
    const state = { ...initDefaultPlayerState(), location_id: 'university_mains', time_of_day: 'evening' as const };
    const { newState } = auditionForPipes(state, db);
    expect(newState.eolian_state.has_talent_pipes).toBe(false);
  });

  test('blocked when eolian not open (morning)', () => {
    const state = {
      ...initDefaultPlayerState(),
      location_id: 'eolian_floor',
      time_of_day: 'morning' as const,
    };
    const { newState } = auditionForPipes(state, db);
    expect(newState.eolian_state.has_talent_pipes).toBe(false);
  });
});

describe('playAtEolian', () => {
  test('fails without talent pipes', () => {
    const state = {
      ...initDefaultPlayerState(),
      location_id: 'eolian_floor',
      time_of_day: 'evening' as const,
      eolian_state: { has_talent_pipes: false, last_audition_day: null, performances_today: 0 },
    };
    const { message } = playAtEolian(state, db);
    expect(message.toLowerCase()).toContain('pipes');
  });

  test('succeeds with talent pipes at eolian in evening', () => {
    const state = {
      ...initDefaultPlayerState(),
      location_id: 'eolian_floor',
      time_of_day: 'evening' as const,
      eolian_state: { has_talent_pipes: true, last_audition_day: null, performances_today: 0 },
    };
    const { newState } = playAtEolian(state, db);
    expect(newState.eolian_state.performances_today).toBe(1);
  });
});
