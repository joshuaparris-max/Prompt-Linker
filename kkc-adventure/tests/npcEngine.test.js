"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const npcEngine_1 = require("../src/engine/npcEngine");
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
describe('parseNPCCommand', () => {
    test('"talk to simmon" returns { npc_id: "simmon", topic: null }', () => {
        expect((0, npcEngine_1.parseNPCCommand)('talk to simmon')).toEqual({ npc_id: 'simmon', topic: null });
    });
    test('"ask wilem about classes" returns { npc_id: "wilem", topic: "classes" }', () => {
        expect((0, npcEngine_1.parseNPCCommand)('ask wilem about classes')).toEqual({ npc_id: 'wilem', topic: 'classes' });
    });
    test('"look around" returns null', () => {
        expect((0, npcEngine_1.parseNPCCommand)('look around')).toBeNull();
    });
});
describe('isNPCPresent', () => {
    test('returns true when npc.location_id matches state.location_id', () => {
        const npc = {
            id: 'simmon',
            name: 'Simmon',
            location_id: 'university_ankers',
            era: 'university',
            temperament: '',
            speech_style: '',
        };
        const state = { ...(0, state_1.initDefaultPlayerState)(), location_id: 'university_ankers' };
        expect((0, npcEngine_1.isNPCPresent)(npc, state)).toBe(true);
    });
    test('returns false when locations differ', () => {
        const npc = {
            id: 'simmon',
            name: 'Simmon',
            location_id: 'university_ankers',
            era: 'university',
            temperament: '',
            speech_style: '',
        };
        const state = { ...(0, state_1.initDefaultPlayerState)(), location_id: 'university_mains' };
        expect((0, npcEngine_1.isNPCPresent)(npc, state)).toBe(false);
    });
});
describe('talkToNPC', () => {
    test('talkToNPC simmon at university_ankers returns non-empty string', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), location_id: 'university_ankers' };
        const result = (0, npcEngine_1.talkToNPC)('simmon', null, state, db);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
    test('talkToNPC simmon when player is at university_mains returns "not here" message', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), location_id: 'university_mains' };
        const result = (0, npcEngine_1.talkToNPC)('simmon', null, state, db);
        expect(result.toLowerCase()).toContain("isn't here");
    });
});
//# sourceMappingURL=npcEngine.test.js.map