import { InventoryItem, PlayerState, SympathyAttempt, SympathyOutcome, SympathyResult } from '../types';

const VALID_SYMPATHY_MATERIALS = [
  'candle_tallow',
  'wicking',
  'iron_drab',
  'clay_lump',
  'pine_pitch',
  'wax_stub',
];

export const MATERIAL_PRICES: Record<string, number> = {
  candle_tallow: 2,
  wicking: 3,
  iron_drab: 1,
  clay_lump: 2,
  pine_pitch: 4,
  wax_stub: 1,
};

export function getSimilarityScore(source_item_id: string, target_item_id: string): number {
  if (source_item_id === target_item_id) return 1.0;

  const metalItems = new Set(['iron_drab']);
  const waxItems = new Set(['candle_tallow', 'wax_stub']);
  const cordItems = new Set(['wicking']);
  const organicItems = new Set(['clay_lump', 'pine_pitch']);

  const sourceIsMetal = metalItems.has(source_item_id);
  const targetIsMetal = metalItems.has(target_item_id);
  const sourceIsWax = waxItems.has(source_item_id);
  const targetIsWax = waxItems.has(target_item_id);
  const sourceIsCord = cordItems.has(source_item_id);
  const targetIsCord = cordItems.has(target_item_id);
  const sourceIsOrganic = organicItems.has(source_item_id);
  const targetIsOrganic = organicItems.has(target_item_id);

  if (sourceIsMetal && targetIsMetal) return 0.7;
  if (sourceIsWax && targetIsWax) return 0.65;
  if ((sourceIsWax && targetIsCord) || (sourceIsCord && targetIsWax)) return 0.3;
  if ((sourceIsMetal && (targetIsOrganic || targetIsWax || targetIsCord)) ||
      ((sourceIsOrganic || sourceIsWax || sourceIsCord) && targetIsMetal)) return 0.15;

  return 0.1;
}

export function calculateHeatCost(similarity: number, alar_strength: number): number {
  const base_cost = 15;
  const efficiency_reduction = Math.floor(similarity * 10);
  const alar_modifier = alar_strength < 40 ? 5 : 0;
  const total = base_cost - efficiency_reduction + alar_modifier;
  return Math.max(3, Math.min(25, total));
}

export function calculateRisk(state: PlayerState, similarity: number): number {
  let base_risk = 20;

  if (state.warmth < 30) base_risk += 30;
  else if (state.warmth < 50) base_risk += 15;

  if (state.fatigue > 70) base_risk += 15;
  if (state.hunger > 70) base_risk += 10;

  if (state.sympathy_state.alar_strength < 30) base_risk += 25;
  if (state.sympathy_state.times_used_today >= 3) base_risk += 20;

  if (similarity < 0.2) base_risk += 20;
  else if (similarity >= 0.6) base_risk -= 10;

  return Math.max(5, Math.min(95, base_risk));
}

export function resolveOutcome(risk: number, state: PlayerState): SympathyOutcome {
  const seed = (
    state.sympathy_state.times_used_today * 17 +
    state.day_number * 7 +
    Math.floor(state.warmth) +
    Math.floor(state.sympathy_state.alar_strength)
  ) % 100;

  if (seed >= risk) return 'success';
  if (seed >= risk - 20) return 'slip';
  if (seed >= risk - 40) return 'bleedthrough';
  return 'backlash';
}

export function adjudicate(attempt: SympathyAttempt, state: PlayerState): SympathyResult {
  const hasSource = state.inventory.some(
    item => item.id === attempt.source_item_id && item.quantity > 0,
  );

  if (!hasSource) {
    return {
      outcome: 'blocked',
      heat_cost: 0,
      alar_cost: 0,
      injury: null,
      narration_key: 'no_source_material',
      state_changes: {},
    };
  }

  const targetValid =
    VALID_SYMPATHY_MATERIALS.includes(attempt.target_item_id) ||
    state.inventory.some(item => item.id === attempt.target_item_id && item.quantity > 0);

  if (!targetValid) {
    return {
      outcome: 'blocked',
      heat_cost: 0,
      alar_cost: 0,
      injury: null,
      narration_key: 'invalid_target',
      state_changes: {},
    };
  }

  if (state.sympathy_state.alar_strength < 10) {
    return {
      outcome: 'blocked',
      heat_cost: 0,
      alar_cost: 0,
      injury: null,
      narration_key: 'alar_broken',
      state_changes: {},
    };
  }

  if (state.warmth < 10) {
    return {
      outcome: 'blocked',
      heat_cost: 0,
      alar_cost: 0,
      injury: null,
      narration_key: 'too_cold',
      state_changes: {},
    };
  }

  const similarity = getSimilarityScore(attempt.source_item_id, attempt.target_item_id);
  const heat_cost = calculateHeatCost(similarity, state.sympathy_state.alar_strength);
  const risk = calculateRisk(state, similarity);
  const outcome = resolveOutcome(risk, state);

  switch (outcome) {
    case 'success':
      return {
        outcome,
        heat_cost,
        alar_cost: 5,
        injury: null,
        narration_key: 'success',
        state_changes: {
          warmth: Math.max(0, state.sympathy_state.warmth - heat_cost),
          alar_strength: Math.max(0, state.sympathy_state.alar_strength - 5),
          times_used_today: state.sympathy_state.times_used_today + 1,
        },
      };

    case 'slip':
      return {
        outcome,
        heat_cost: Math.floor(heat_cost / 2),
        alar_cost: 10,
        injury: null,
        narration_key: 'slip',
        state_changes: {
          warmth: Math.max(0, state.sympathy_state.warmth - Math.floor(heat_cost / 2)),
          alar_strength: Math.max(0, state.sympathy_state.alar_strength - 10),
          times_used_today: state.sympathy_state.times_used_today + 1,
        },
      };

    case 'bleedthrough':
      return {
        outcome,
        heat_cost,
        alar_cost: 15,
        injury: 'minor sympathetic bleedthrough — sensation in hands',
        narration_key: 'bleedthrough',
        state_changes: {
          warmth: Math.max(0, state.sympathy_state.warmth - heat_cost),
          alar_strength: Math.max(0, state.sympathy_state.alar_strength - 15),
          times_used_today: state.sympathy_state.times_used_today + 1,
        },
      };

    case 'backlash': {
      const backlashWarmth = Math.max(0, state.sympathy_state.warmth - heat_cost * 2);
      return {
        outcome,
        heat_cost: heat_cost * 2,
        alar_cost: 25,
        injury: 'sympathetic backlash — muscle spasm, pain in chest',
        narration_key: 'backlash',
        state_changes: {
          warmth: backlashWarmth,
          alar_strength: Math.max(0, state.sympathy_state.alar_strength - 25),
          times_used_today: state.sympathy_state.times_used_today + 1,
        },
      };
    }

    default:
      return {
        outcome: 'blocked',
        heat_cost: 0,
        alar_cost: 0,
        injury: null,
        narration_key: 'blocked_general',
        state_changes: {},
      };
  }
}

export function applySympathyResult(state: PlayerState, result: SympathyResult): PlayerState {
  const sc = result.state_changes;

  const newSympathyState = {
    ...state.sympathy_state,
    warmth: sc.warmth ?? state.sympathy_state.warmth,
    alar_strength: sc.alar_strength ?? state.sympathy_state.alar_strength,
    times_used_today: sc.times_used_today ?? state.sympathy_state.times_used_today,
  };

  const newInjuries =
    result.injury !== null ? [...state.injuries, result.injury] : [...state.injuries];

  return {
    ...state,
    warmth: newSympathyState.warmth,
    sympathy_state: newSympathyState,
    injuries: newInjuries,
  };
}

export function buyMaterial(
  item_id: string,
  quantity: number,
  state: PlayerState,
): { newState: PlayerState; message: string } {
  if (state.location_id !== 'university_fishery_outer') {
    return {
      newState: state,
      message: "Kilvin's students sell materials, but you're not in the Fishery.",
    };
  }

  const price = MATERIAL_PRICES[item_id];
  if (price === undefined) {
    return { newState: state, message: "That's not something you can buy here." };
  }

  const totalCost = price * quantity;
  if (state.money_drabs < totalCost) {
    return { newState: state, message: "You haven't the coin for that." };
  }

  const existingIdx = state.inventory.findIndex(i => i.id === item_id);
  let newInventory: InventoryItem[];

  if (existingIdx >= 0) {
    newInventory = state.inventory.map((item, idx) =>
      idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item,
    );
  } else {
    const names: Record<string, string> = {
      candle_tallow: 'tallow candle',
      wicking: 'wicking cord',
      iron_drab: 'iron drab',
      clay_lump: 'clay lump',
      pine_pitch: 'pine pitch',
      wax_stub: 'wax stub',
    };
    newInventory = [
      ...state.inventory,
      { id: item_id, name: names[item_id] ?? item_id, quantity, notes: 'Sympathy material.' },
    ];
  }

  return {
    newState: {
      ...state,
      money_drabs: state.money_drabs - totalCost,
      inventory: newInventory,
    },
    message: `You pay ${totalCost} drabs and take the ${item_id.replace('_', ' ')}.`,
  };
}

export function parseSympathyCommand(input: string, state: PlayerState): SympathyAttempt | null {
  const lower = input.trim().toLowerCase();

  if (lower === 'use sympathy') {
    const candle = state.inventory.find(
      i => i.id === 'candle_tallow' && i.quantity > 0,
    );
    if (!candle) return null;
    return { source_item_id: 'candle_tallow', target_item_id: 'candle_tallow', intent: 'basic binding' };
  }

  const bindMatch = lower.match(/^bind\s+(.+?)\s+to\s+(.+)$/);
  if (bindMatch) {
    const sourceInput = bindMatch[1].trim();
    const targetInput = bindMatch[2].trim();

    const findItem = (input: string) => {
      return state.inventory.find(
        item =>
          item.quantity > 0 &&
          (item.id.toLowerCase().includes(input) || item.name.toLowerCase().includes(input)),
      );
    };

    const sourceItem = findItem(sourceInput);
    if (!sourceItem) return null;

    const targetItem = findItem(targetInput);
    const target_item_id = targetItem ? targetItem.id : targetInput.replace(/\s+/g, '_');

    return { source_item_id: sourceItem.id, target_item_id, intent: `bind ${sourceInput} to ${targetInput}` };
  }

  const intentMatch = lower.match(/^use sympathy to\s+(.+)$/);
  if (intentMatch) {
    const intent = intentMatch[1].trim();
    const suitable = state.inventory.find(
      i => VALID_SYMPATHY_MATERIALS.includes(i.id) && i.quantity > 0,
    );
    if (!suitable) return null;

    const same = state.inventory.find(
      i => i.id === suitable.id && i.quantity > (i.id === suitable.id ? 0 : 0),
    );
    const target_item_id = same ? same.id : 'candle_tallow';

    return { source_item_id: suitable.id, target_item_id, intent };
  }

  return null;
}
