import Database from 'better-sqlite3';
import { CommandResult, NarrationProvider, PlayerState } from '../types';
import { getLocation, getNPCsAtLocation, getAccessibleExits, movePlayer } from './movement';
import { advanceTime } from './time';
import { renderStatus, renderInventory, alarLabel, warmthLabel } from '../narration/renderStatus';
import { eat, sleep, busk, payTuition, checkTuitionDeadline } from './economy';
import { parseNPCCommand, talkToNPC } from './npcEngine';
import {
  adjudicate,
  applySympathyResult,
  parseSympathyCommand,
  buyMaterial,
} from './sympathyEngine';
import { SYMPATHY_NARRATION } from '../content/sympathyNarration';
import { askKilvinForWork, workFishery, respondToAmbrose } from './socialEngine';
import { auditionForPipes, playAtEolian } from './musicEngine';

const DIRECTION_WORDS = new Set([
  'north', 'south', 'east', 'west', 'up', 'down', 'in', 'out', 'enter',
]);

export async function dispatch(
  input: string,
  state: PlayerState,
  db: Database.Database,
  narrator: NarrationProvider,
): Promise<CommandResult> {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  function makeResult(output: string, newState: PlayerState, shouldExit = false): CommandResult {
    return { output, newState, shouldExit };
  }

  // ── look ─────────────────────────────────────────────────────────────
  if (lower === 'look' || lower === 'look around') {
    const location = getLocation(db, state.location_id);
    if (!location) return makeResult('You are nowhere discernible.', state);
    const npcs = getNPCsAtLocation(db, state.location_id);
    const exits = getAccessibleExits(location, state);
    return makeResult(narrator.renderLocation(location, state, npcs, exits), state);
  }

  // ── movement ─────────────────────────────────────────────────────────
  if (DIRECTION_WORDS.has(lower) || lower.startsWith('go ')) {
    const dir = lower.startsWith('go ') ? lower.slice(3).trim() : lower;
    const result = movePlayer(db, state, dir);

    if (!result.success) {
      return makeResult(result.message, state);
    }

    const location = getLocation(db, result.newState.location_id);
    if (!location) return makeResult('You arrive somewhere unfamiliar.', result.newState);

    const npcs = getNPCsAtLocation(db, result.newState.location_id);
    const exits = getAccessibleExits(location, result.newState);
    const arrivalLine = `You make your way ${dir}.`;
    const locationStr = narrator.renderLocation(location, result.newState, npcs, exits);

    return makeResult(`${arrivalLine}\n\n${locationStr}`, result.newState);
  }

  // ── wait ─────────────────────────────────────────────────────────────
  if (lower === 'wait') {
    const newState = checkTuitionDeadline(advanceTime(state));
    const location = getLocation(db, newState.location_id);
    if (!location) return makeResult(narrator.renderWait(newState), newState);
    const npcs = getNPCsAtLocation(db, newState.location_id);
    const exits = getAccessibleExits(location, newState);
    const waitStr = narrator.renderWait(newState);
    const locStr = narrator.renderLocation(location, newState, npcs, exits);
    return makeResult(`${waitStr}\n\n${locStr}`, newState);
  }

  // ── status ───────────────────────────────────────────────────────────
  if (lower === 'status' || lower === 'stats') {
    return makeResult(renderStatus(state), state);
  }

  // ── inventory ────────────────────────────────────────────────────────
  if (lower === 'inventory' || lower === 'inv' || lower === 'i') {
    return makeResult(renderInventory(state), state);
  }

  // ── help ─────────────────────────────────────────────────────────────
  if (lower === 'help') {
    return makeResult(narrator.renderHelp(), state);
  }

  // ── quit / exit ───────────────────────────────────────────────────────
  if (lower === 'quit' || lower === 'exit') {
    return makeResult('You step away from the present moment. The world continues without you.', state, true);
  }

  // ── eat ───────────────────────────────────────────────────────────────
  if (lower === 'eat') {
    const { newState: afterEat, message } = eat(state);
    const afterCheck = checkTuitionDeadline(afterEat);
    let output = message;
    if (!afterCheck.tuition_state.overdue && afterEat.tuition_state.overdue === false
        && afterCheck.tuition_state.overdue) {
      output += '\n\nA thought nags at you. Your tuition was due.';
    }
    return makeResult(output, afterCheck);
  }

  // ── sleep / rest ───────────────────────────────────────────────────────
  if (lower === 'sleep' || lower === 'rest') {
    const { newState: afterSleep, message } = sleep(state);
    if (afterSleep === state) {
      return makeResult(message, state);
    }
    const afterCheck = checkTuitionDeadline(afterSleep);
    const location = getLocation(db, afterCheck.location_id);
    if (!location) return makeResult(message, afterCheck);
    const npcs = getNPCsAtLocation(db, afterCheck.location_id);
    const exits = getAccessibleExits(location, afterCheck);
    const locStr = narrator.renderLocation(location, afterCheck, npcs, exits);
    return makeResult(`${message}\n\n${locStr}`, afterCheck);
  }

  // ── busk / play / perform ─────────────────────────────────────────────
  if (lower === 'busk' || lower === 'play' || lower === 'perform') {
    const { newState, message } = busk(state);
    const afterCheck = checkTuitionDeadline(newState);
    return makeResult(message, afterCheck);
  }

  // ── pay tuition ──────────────────────────────────────────────────────
  if (lower === 'pay tuition' || lower === 'pay fees') {
    const { newState, message } = payTuition(state);
    const afterCheck = checkTuitionDeadline(newState);
    return makeResult(message, afterCheck);
  }

  // ── talk to / speak to / ask about ───────────────────────────────────
  const npcCmd = parseNPCCommand(lower);
  if (npcCmd) {
    const response = talkToNPC(npcCmd.npc_id, npcCmd.topic, state, db);
    return makeResult(response, state);
  }

  // ── sympathy status / alar status ────────────────────────────────────
  if (lower === 'sympathy status' || lower === 'alar status') {
    const s = state.sympathy_state;
    const lines = [
      `Alar strength: ${alarLabel(s.alar_strength)}`,
      `Warmth: ${warmthLabel(state.warmth)}`,
      `Times used today: ${s.times_used_today}`,
      `Active bindings: ${s.active_bindings}`,
    ];
    return makeResult(lines.join('\n'), state);
  }

  // ── use sympathy / bind x to y ────────────────────────────────────────
  if (lower === 'use sympathy' || lower.startsWith('bind ') || lower.startsWith('use sympathy to ')) {
    const attempt = parseSympathyCommand(lower, state);
    if (!attempt) {
      return makeResult(narrator.renderFallback(trimmed, state), state);
    }

    const result = adjudicate(attempt, state);
    const newState = checkTuitionDeadline(applySympathyResult(state, result));

    const narrationPool = SYMPATHY_NARRATION[result.narration_key] ?? SYMPATHY_NARRATION['blocked_general'];
    const narrationIdx = state.sympathy_state.times_used_today % 3;
    let output = narrationPool[narrationIdx];

    if (result.injury !== null) {
      output += `\n\n${result.injury}.`;
    }

    if (newState.warmth < 30) {
      output += '\n\nYou are very cold. This is becoming dangerous.';
    }

    return makeResult(output, newState);
  }

  // ── buy [item] ────────────────────────────────────────────────────────
  if (lower.startsWith('buy ')) {
    const rest = lower.slice(4).trim();
    const quantityMatch = rest.match(/^(\d+)\s+(.+)$/);
    let quantity = 1;
    let itemInput = rest;

    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1], 10);
      itemInput = quantityMatch[2].trim();
    }

    const item_id = itemInput.replace(/\s+/g, '_');
    const { newState, message } = buyMaterial(item_id, quantity, state);
    const afterCheck = checkTuitionDeadline(newState);
    return makeResult(message, afterCheck);
  }

  // ── ask kilvin for work ────────────────────────────────────────────────
  if (lower === 'ask kilvin for work' || lower === 'ask kilvin about work') {
    const { message, newState } = askKilvinForWork(state, db);
    const afterCheck = checkTuitionDeadline(newState);
    return makeResult(message, afterCheck);
  }

  // ── work fishery ──────────────────────────────────────────────────────
  if (lower === 'work fishery' || lower === 'work at fishery' || lower === 'work at the fishery') {
    const { message, newState } = workFishery(state, db);
    const afterCheck = checkTuitionDeadline(newState);
    return makeResult(message, afterCheck);
  }

  // ── ignore ambrose ────────────────────────────────────────────────────
  if (lower === 'ignore ambrose') {
    const { message, newState } = respondToAmbrose('ignore', state, db);
    const afterCheck = checkTuitionDeadline(newState);
    return makeResult(message, afterCheck);
  }

  // ── answer ambrose carefully ──────────────────────────────────────────
  if (lower === 'answer ambrose carefully' || lower === 'answer ambrose careful') {
    const { message, newState } = respondToAmbrose('careful', state, db);
    const afterCheck = checkTuitionDeadline(newState);
    return makeResult(message, afterCheck);
  }

  // ── answer ambrose sharply ────────────────────────────────────────────
  if (lower === 'answer ambrose sharply' || lower === 'answer ambrose sharp') {
    const { message, newState } = respondToAmbrose('sharp', state, db);
    const afterCheck = checkTuitionDeadline(newState);
    return makeResult(message, afterCheck);
  }

  // ── audition for pipes ────────────────────────────────────────────────
  if (lower === 'audition for pipes' || lower === 'audition') {
    const { message, newState } = auditionForPipes(state, db);
    const afterCheck = checkTuitionDeadline(newState);
    return makeResult(message, afterCheck);
  }

  // ── play at eolian ────────────────────────────────────────────────────
  if (lower === 'play at eolian' || lower === 'play at the eolian') {
    const { message, newState } = playAtEolian(state, db);
    const afterCheck = checkTuitionDeadline(newState);
    return makeResult(message, afterCheck);
  }

  // ── fallback ─────────────────────────────────────────────────────────
  return makeResult(narrator.renderFallback(trimmed, state), state);
}
