import Database from 'better-sqlite3';
import { formatCurrency } from '../src/narration/renderStatus';
import { advanceTime } from '../src/engine/time';
import { movePlayer, getLocation } from '../src/engine/movement';
import { runMigrations } from '../src/db/schema';
import { runSeed } from '../src/db/seed';
import { initDefaultPlayerState } from '../src/engine/state';

describe('formatCurrency', () => {
  test('300 drabs -> "3 talents"', () => {
    expect(formatCurrency(300)).toBe('3 talents');
  });

  test('125 drabs -> "1 talent, 2 jots, 5 drabs"', () => {
    expect(formatCurrency(125)).toBe('1 talent, 2 jots, 5 drabs');
  });

  test('15 drabs -> "1 jot, 5 drabs"', () => {
    expect(formatCurrency(15)).toBe('1 jot, 5 drabs');
  });

  test('7 drabs -> "7 drabs"', () => {
    expect(formatCurrency(7)).toBe('7 drabs');
  });

  test('0 drabs -> "nothing"', () => {
    expect(formatCurrency(0)).toBe('nothing');
  });
});

describe('advanceTime', () => {
  test('morning + 1 step -> afternoon, day unchanged', () => {
    const state = { ...initDefaultPlayerState(), time_of_day: 'morning' as const, day_number: 1 };
    const next = advanceTime(state, 1);
    expect(next.time_of_day).toBe('afternoon');
    expect(next.day_number).toBe(1);
  });

  test('night + 1 step -> morning, day incremented', () => {
    const state = { ...initDefaultPlayerState(), time_of_day: 'night' as const, day_number: 3 };
    const next = advanceTime(state, 1);
    expect(next.time_of_day).toBe('morning');
    expect(next.day_number).toBe(4);
  });
});

describe('movePlayer', () => {
  let db: Database.Database;

  beforeAll(() => {
    db = new Database(':memory:');
    runMigrations(db);
    runSeed(db);
  });

  afterAll(() => {
    db.close();
  });

  test('moving north from university_mains succeeds and moves to artificery', () => {
    const state = { ...initDefaultPlayerState(), location_id: 'university_mains' };
    const result = movePlayer(db, state, 'north');
    expect(result.success).toBe(true);
    expect(result.newState.location_id).toBe('university_artificery');
  });

  test('moving west from university_medica fails — no west exit', () => {
    const state = { ...initDefaultPlayerState(), location_id: 'university_medica' };
    const result = movePlayer(db, state, 'west');
    expect(result.success).toBe(false);
    expect(result.message).toBe('You cannot go that way.');
  });

  test('entering archives as E_lir is blocked with Re\'lar message', () => {
    const state = {
      ...initDefaultPlayerState(),
      location_id: 'university_archives_exterior',
      academic_rank: 'E_lir' as const,
    };
    const result = movePlayer(db, state, 'enter');
    expect(result.success).toBe(false);
    expect(result.message).toContain("Re'lar");
  });
});
