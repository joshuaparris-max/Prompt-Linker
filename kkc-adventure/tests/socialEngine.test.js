"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const socialEngine_1 = require("../src/engine/socialEngine");
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
describe('getNpcTrust', () => {
    test('returns trust value when present', () => {
        const state = (0, state_1.initDefaultPlayerState)();
        expect((0, socialEngine_1.getNpcTrust)(state, 'kilvin')).toBe(45);
    });
    test('returns 50 for unknown npc', () => {
        const state = (0, state_1.initDefaultPlayerState)();
        expect((0, socialEngine_1.getNpcTrust)(state, 'unknown_npc')).toBe(50);
    });
});
describe('setNpcTrust', () => {
    test('clamps value to 0-100', () => {
        const state = (0, state_1.initDefaultPlayerState)();
        const clamped = (0, socialEngine_1.setNpcTrust)(state, 'kilvin', 150);
        expect((0, socialEngine_1.getNpcTrust)(clamped, 'kilvin')).toBe(100);
        const clamped2 = (0, socialEngine_1.setNpcTrust)(state, 'kilvin', -10);
        expect((0, socialEngine_1.getNpcTrust)(clamped2, 'kilvin')).toBe(0);
    });
});
describe('adjustUniversitySocial', () => {
    test('adjusts university social within 0-100', () => {
        const state = (0, state_1.initDefaultPlayerState)();
        const up = (0, socialEngine_1.adjustUniversitySocial)(state, 20);
        expect(up.reputation.university_social).toBe(60);
        const down = (0, socialEngine_1.adjustUniversitySocial)(state, -50);
        expect(down.reputation.university_social).toBe(0);
    });
});
describe('askKilvinForWork', () => {
    test('returns denial when not at fishery', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), location_id: 'university_mains' };
        const { message, newState } = (0, socialEngine_1.askKilvinForWork)(state, db);
        expect(message).toBeTruthy();
        expect(newState.fishery_state.approved_today).toBe(false);
    });
    test('approves work when at fishery and fit', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            location_id: 'university_fishery_outer',
            fatigue: 30,
            warmth: 70,
            injuries: [],
        };
        const { message, newState } = (0, socialEngine_1.askKilvinForWork)(state, db);
        expect(newState.fishery_state.approved_today).toBe(true);
        expect(message).toBeTruthy();
    });
    test('denies work when player is exhausted', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            location_id: 'university_fishery_outer',
            fatigue: 90,
        };
        const { message, newState } = (0, socialEngine_1.askKilvinForWork)(state, db);
        expect(newState.fishery_state.approved_today).toBe(false);
        expect(message).toBeTruthy();
    });
});
describe('respondToAmbrose', () => {
    test('ignore reduces university social slightly', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            location_id: 'university_archives_exterior',
        };
        const before = state.reputation.university_social;
        const { newState } = (0, socialEngine_1.respondToAmbrose)('ignore', state, db);
        expect(newState.reputation.university_social).toBeLessThan(before);
    });
    test('careful answer increases university social', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            location_id: 'university_archives_exterior',
        };
        const before = state.reputation.university_social;
        const { newState } = (0, socialEngine_1.respondToAmbrose)('careful', state, db);
        expect(newState.reputation.university_social).toBeGreaterThan(before);
    });
    test('returns not-here message when ambrose absent', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            location_id: 'university_mains',
        };
        const { message } = (0, socialEngine_1.respondToAmbrose)('ignore', state, db);
        expect(message.toLowerCase()).toContain('not');
    });
});
//# sourceMappingURL=socialEngine.test.js.map