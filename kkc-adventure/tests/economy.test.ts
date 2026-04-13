import { eat, sleep, busk, payTuition, checkTuitionDeadline } from '../src/engine/economy';
import { initDefaultPlayerState } from '../src/engine/state';

describe('eat', () => {
  test('with sufficient funds deducts 3 drabs and reduces hunger', () => {
    const state = { ...initDefaultPlayerState(), money_drabs: 50, hunger: 60 };
    const { newState, message } = eat(state);
    expect(newState.money_drabs).toBe(47);
    expect(newState.hunger).toBe(20);
    expect(message).toBeTruthy();
  });

  test('with 0 drabs returns failure and unchanged state', () => {
    const state = { ...initDefaultPlayerState(), money_drabs: 0 };
    const { newState, message } = eat(state);
    expect(newState.money_drabs).toBe(0);
    expect(message).toContain("haven't");
  });
});

describe('sleep', () => {
  test('at mews room sets fatigue to 0 and does not deduct drabs', () => {
    const state = {
      ...initDefaultPlayerState(),
      location_id: 'university_mews_room',
      money_drabs: 100,
      fatigue: 80,
    };
    const { newState, message } = sleep(state);
    expect(newState.fatigue).toBe(0);
    expect(newState.money_drabs).toBe(100);
    expect(message).toBeTruthy();
  });

  test('at university_mains returns failure message', () => {
    const state = { ...initDefaultPlayerState(), location_id: 'university_mains' };
    const { newState, message } = sleep(state);
    expect(newState).toBe(state);
    expect(message).toContain('somewhere');
  });
});

describe('busk', () => {
  test('at university_ankers adds drabs to money_drabs', () => {
    const state = { ...initDefaultPlayerState(), location_id: 'university_ankers', money_drabs: 10 };
    const { newState } = busk(state);
    expect(newState.money_drabs).toBeGreaterThan(10);
  });

  test('at university_mains returns failure message', () => {
    const state = { ...initDefaultPlayerState(), location_id: 'university_mains' };
    const { newState, message } = busk(state);
    expect(newState).toBe(state);
    expect(message).toContain('nowhere');
  });
});

describe('payTuition', () => {
  test('with sufficient funds sets tuition_state.paid = true', () => {
    const state = { ...initDefaultPlayerState(), money_drabs: 100 };
    const { newState, message } = payTuition(state);
    expect(newState.tuition_state.paid).toBe(true);
    expect(message).toContain('pay');
  });

  test('with insufficient funds returns failure message', () => {
    const state = { ...initDefaultPlayerState(), money_drabs: 0 };
    const { newState, message } = payTuition(state);
    expect(newState.tuition_state.paid).toBe(false);
    expect(message).toContain("don't");
  });
});

describe('checkTuitionDeadline', () => {
  test('sets overdue when day_number >= due_on_day and not paid', () => {
    const state = {
      ...initDefaultPlayerState(),
      day_number: 14,
      tuition_state: { amount_drabs: 30, due_on_day: 14, paid: false, overdue: false },
    };
    const result = checkTuitionDeadline(state);
    expect(result.tuition_state.overdue).toBe(true);
  });

  test('does not set overdue when already paid', () => {
    const state = {
      ...initDefaultPlayerState(),
      day_number: 20,
      tuition_state: { amount_drabs: 30, due_on_day: 14, paid: true, overdue: false },
    };
    const result = checkTuitionDeadline(state);
    expect(result.tuition_state.overdue).toBe(false);
  });
});
