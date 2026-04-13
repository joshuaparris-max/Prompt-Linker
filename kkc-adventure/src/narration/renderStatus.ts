import { PlayerState } from '../types';

export function formatCurrency(drabs: number): string {
  if (drabs === 0) return 'nothing';

  const talents = Math.floor(drabs / 100);
  const remainder = drabs % 100;
  const jots = Math.floor(remainder / 10);
  const remainingDrabs = remainder % 10;

  const parts: string[] = [];
  if (talents > 0) parts.push(`${talents} talent${talents !== 1 ? 's' : ''}`);
  if (jots > 0) parts.push(`${jots} jot${jots !== 1 ? 's' : ''}`);
  if (remainingDrabs > 0) parts.push(`${remainingDrabs} drab${remainingDrabs !== 1 ? 's' : ''}`);

  return parts.join(', ');
}

export function hungerLabel(hunger: number): string {
  if (hunger <= 20) return 'well-fed';
  if (hunger <= 50) return 'peckish';
  if (hunger <= 80) return 'hungry';
  return 'starving';
}

export function fatigueLabel(fatigue: number): string {
  if (fatigue <= 20) return 'rested';
  if (fatigue <= 50) return 'tired';
  if (fatigue <= 80) return 'weary';
  return 'exhausted';
}

export function alarLabel(alar_strength: number): string {
  if (alar_strength >= 80) return 'sharp';
  if (alar_strength >= 50) return 'steady';
  if (alar_strength >= 30) return 'strained';
  if (alar_strength >= 10) return 'fragile';
  return 'broken';
}

export function warmthLabel(warmth: number): string {
  if (warmth >= 80) return 'warm';
  if (warmth >= 60) return 'comfortable';
  if (warmth >= 40) return 'cool';
  if (warmth >= 20) return 'cold';
  return 'dangerously cold';
}

export function renderStatus(state: PlayerState): string {
  const lines: string[] = [
    `Character: ${state.character_id} (${state.era})`,
    `Location: ${state.location_id}`,
    `Money: ${formatCurrency(state.money_drabs)}`,
    `Academic rank: ${state.academic_rank}`,
    `Time: ${state.time_of_day}, day ${state.day_number}, term ${state.term_number}`,
    `Hunger: ${hungerLabel(state.hunger)}`,
    `Fatigue: ${fatigueLabel(state.fatigue)}`,
    `Alar: ${alarLabel(state.sympathy_state.alar_strength)}`,
    `Warmth: ${warmthLabel(state.warmth)}`,
  ];

  if (state.injuries.length > 0) {
    lines.push(`Injuries: ${state.injuries.join('; ')}`);
  }

  if (state.eolian_state.has_talent_pipes) {
    lines.push('You carry the talent pipes.');
  }

  return lines.join('\n');
}

export function renderInventory(state: PlayerState): string {
  if (state.inventory.length === 0) {
    return 'You are carrying nothing of note.';
  }

  const lines = state.inventory.map(item => {
    const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
    const notes = item.notes ? ` (${item.notes})` : '';
    return `  ${item.name}${qty}${notes}`;
  });

  return 'You are carrying:\n' + lines.join('\n');
}
