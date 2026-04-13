"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const renderStatus_1 = require("../src/narration/renderStatus");
const time_1 = require("../src/engine/time");
const movement_1 = require("../src/engine/movement");
const schema_1 = require("../src/db/schema");
const seed_1 = require("../src/db/seed");
const state_1 = require("../src/engine/state");
describe('formatCurrency', () => {
    test('300 drabs -> "3 talents"', () => {
        expect((0, renderStatus_1.formatCurrency)(300)).toBe('3 talents');
    });
    test('125 drabs -> "1 talent, 2 jots, 5 drabs"', () => {
        expect((0, renderStatus_1.formatCurrency)(125)).toBe('1 talent, 2 jots, 5 drabs');
    });
    test('15 drabs -> "1 jot, 5 drabs"', () => {
        expect((0, renderStatus_1.formatCurrency)(15)).toBe('1 jot, 5 drabs');
    });
    test('7 drabs -> "7 drabs"', () => {
        expect((0, renderStatus_1.formatCurrency)(7)).toBe('7 drabs');
    });
    test('0 drabs -> "nothing"', () => {
        expect((0, renderStatus_1.formatCurrency)(0)).toBe('nothing');
    });
});
describe('advanceTime', () => {
    test('morning + 1 step -> afternoon, day unchanged', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), time_of_day: 'morning', day_number: 1 };
        const next = (0, time_1.advanceTime)(state, 1);
        expect(next.time_of_day).toBe('afternoon');
        expect(next.day_number).toBe(1);
    });
    test('night + 1 step -> morning, day incremented', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), time_of_day: 'night', day_number: 3 };
        const next = (0, time_1.advanceTime)(state, 1);
        expect(next.time_of_day).toBe('morning');
        expect(next.day_number).toBe(4);
    });
});
describe('movePlayer', () => {
    let db;
    beforeAll(() => {
        db = new better_sqlite3_1.default(':memory:');
        (0, schema_1.runMigrations)(db);
        (0, seed_1.runSeed)(db);
    });
    afterAll(() => {
        db.close();
    });
    test('moving north from university_mains succeeds and moves to artificery', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), location_id: 'university_mains' };
        const result = (0, movement_1.movePlayer)(db, state, 'north');
        expect(result.success).toBe(true);
        expect(result.newState.location_id).toBe('university_artificery');
    });
    test('moving west from university_medica fails — no west exit', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), location_id: 'university_medica' };
        const result = (0, movement_1.movePlayer)(db, state, 'west');
        expect(result.success).toBe(false);
        expect(result.message).toBe('You cannot go that way.');
    });
    test('entering archives as E_lir is blocked with Re\'lar message', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            location_id: 'university_archives_exterior',
            academic_rank: 'E_lir',
        };
        const result = (0, movement_1.movePlayer)(db, state, 'enter');
        expect(result.success).toBe(false);
        expect(result.message).toContain("Re'lar");
    });
});
//# sourceMappingURL=formatters.test.js.map