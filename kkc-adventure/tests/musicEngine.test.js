"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const musicEngine_1 = require("../src/engine/musicEngine");
const state_1 = require("../src/engine/state");
const schema_1 = require("../src/db/schema");
const seed_1 = require("../src/db/seed");
let db;
beforeAll(() => {
    db = new better_sqlite3_1.default(':memory:');
    (0, schema_1.runMigrations)(db);
    (0, seed_1.runSeed)(db);
});
afterAll(() => {
    db.close();
});
describe('canEnterEolian', () => {
    test('returns true for evening', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), time_of_day: 'evening' };
        expect((0, musicEngine_1.canEnterEolian)(state)).toBe(true);
    });
    test('returns true for night', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), time_of_day: 'night' };
        expect((0, musicEngine_1.canEnterEolian)(state)).toBe(true);
    });
    test('returns false for morning', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), time_of_day: 'morning' };
        expect((0, musicEngine_1.canEnterEolian)(state)).toBe(false);
    });
});
describe('calculateAuditionScore', () => {
    test('returns 0 without a lute', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), inventory: [] };
        expect((0, musicEngine_1.calculateAuditionScore)(state)).toBe(0);
    });
    test('returns positive score with lute and healthy state', () => {
        const state = (0, state_1.initDefaultPlayerState)();
        const score = (0, musicEngine_1.calculateAuditionScore)(state);
        expect(score).toBeGreaterThan(0);
    });
    test('high fatigue reduces score', () => {
        const healthy = (0, state_1.initDefaultPlayerState)();
        const tired = { ...(0, state_1.initDefaultPlayerState)(), fatigue: 80 };
        expect((0, musicEngine_1.calculateAuditionScore)(tired)).toBeLessThan((0, musicEngine_1.calculateAuditionScore)(healthy));
    });
});
describe('auditionForPipes', () => {
    test('blocked when not at eolian floor', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), location_id: 'university_mains', time_of_day: 'evening' };
        const { newState } = (0, musicEngine_1.auditionForPipes)(state, db);
        expect(newState.eolian_state.has_talent_pipes).toBe(false);
    });
    test('blocked when eolian not open (morning)', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            location_id: 'eolian_floor',
            time_of_day: 'morning',
        };
        const { newState } = (0, musicEngine_1.auditionForPipes)(state, db);
        expect(newState.eolian_state.has_talent_pipes).toBe(false);
    });
});
describe('playAtEolian', () => {
    test('fails without talent pipes', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            location_id: 'eolian_floor',
            time_of_day: 'evening',
            eolian_state: { has_talent_pipes: false, last_audition_day: null, performances_today: 0 },
        };
        const { message } = (0, musicEngine_1.playAtEolian)(state, db);
        expect(message.toLowerCase()).toContain('pipes');
    });
    test('succeeds with talent pipes at eolian in evening', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            location_id: 'eolian_floor',
            time_of_day: 'evening',
            eolian_state: { has_talent_pipes: true, last_audition_day: null, performances_today: 0 },
        };
        const { newState } = (0, musicEngine_1.playAtEolian)(state, db);
        expect(newState.eolian_state.performances_today).toBe(1);
    });
});
//# sourceMappingURL=musicEngine.test.js.map