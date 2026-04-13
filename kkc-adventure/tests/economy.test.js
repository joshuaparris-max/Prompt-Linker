"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const economy_1 = require("../src/engine/economy");
const state_1 = require("../src/engine/state");
describe('eat', () => {
    test('with sufficient funds deducts 3 drabs and reduces hunger', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), money_drabs: 50, hunger: 60 };
        const { newState, message } = (0, economy_1.eat)(state);
        expect(newState.money_drabs).toBe(47);
        expect(newState.hunger).toBe(20);
        expect(message).toBeTruthy();
    });
    test('with 0 drabs returns failure and unchanged state', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), money_drabs: 0 };
        const { newState, message } = (0, economy_1.eat)(state);
        expect(newState.money_drabs).toBe(0);
        expect(message).toContain("haven't");
    });
});
describe('sleep', () => {
    test('at mews room sets fatigue to 0 and does not deduct drabs', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            location_id: 'university_mews_room',
            money_drabs: 100,
            fatigue: 80,
        };
        const { newState, message } = (0, economy_1.sleep)(state);
        expect(newState.fatigue).toBe(0);
        expect(newState.money_drabs).toBe(100);
        expect(message).toBeTruthy();
    });
    test('at university_mains returns failure message', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), location_id: 'university_mains' };
        const { newState, message } = (0, economy_1.sleep)(state);
        expect(newState).toBe(state);
        expect(message).toContain('somewhere');
    });
});
describe('busk', () => {
    test('at university_ankers adds drabs to money_drabs', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), location_id: 'university_ankers', money_drabs: 10 };
        const { newState } = (0, economy_1.busk)(state);
        expect(newState.money_drabs).toBeGreaterThan(10);
    });
    test('at university_mains returns failure message', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), location_id: 'university_mains' };
        const { newState, message } = (0, economy_1.busk)(state);
        expect(newState).toBe(state);
        expect(message).toContain('nowhere');
    });
});
describe('payTuition', () => {
    test('with sufficient funds sets tuition_state.paid = true', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), money_drabs: 100 };
        const { newState, message } = (0, economy_1.payTuition)(state);
        expect(newState.tuition_state.paid).toBe(true);
        expect(message).toContain('pay');
    });
    test('with insufficient funds returns failure message', () => {
        const state = { ...(0, state_1.initDefaultPlayerState)(), money_drabs: 0 };
        const { newState, message } = (0, economy_1.payTuition)(state);
        expect(newState.tuition_state.paid).toBe(false);
        expect(message).toContain("don't");
    });
});
describe('checkTuitionDeadline', () => {
    test('sets overdue when day_number >= due_on_day and not paid', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            day_number: 14,
            tuition_state: { amount_drabs: 30, due_on_day: 14, paid: false, overdue: false },
        };
        const result = (0, economy_1.checkTuitionDeadline)(state);
        expect(result.tuition_state.overdue).toBe(true);
    });
    test('does not set overdue when already paid', () => {
        const state = {
            ...(0, state_1.initDefaultPlayerState)(),
            day_number: 20,
            tuition_state: { amount_drabs: 30, due_on_day: 14, paid: true, overdue: false },
        };
        const result = (0, economy_1.checkTuitionDeadline)(state);
        expect(result.tuition_state.overdue).toBe(false);
    });
});
//# sourceMappingURL=economy.test.js.map