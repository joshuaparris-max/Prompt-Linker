import { Exit, Location, NPC, NarrationProvider, NarrationSceneContext, PlayerState } from '../types';
import { renderLocation } from './renderLocation';

const WAIT_LINES = [
  'Time moves through you like water through a cupped hand.',
  'The moment passes. Another follows.',
  'You wait. The world does not.',
  'An hour slides by. The day is shorter now.',
];

const FALLBACK_LINES = [
  'The thought passes without resolution.',
  'Nothing comes of it.',
  'You reconsider.',
  'The moment asks for more than you give it.',
  'It is not the time for that.',
];

export class LocalNarrator implements NarrationProvider {
  renderLocation(location: Location, state: PlayerState, npcs: NPC[], accessibleExits: Exit[]): string {
    return renderLocation(location, state, npcs, accessibleExits);
  }

  renderWait(state: PlayerState): string {
    return WAIT_LINES[state.day_number % WAIT_LINES.length];
  }

  renderFallback(input: string, state: PlayerState): string {
    return FALLBACK_LINES[input.length % FALLBACK_LINES.length];
  }

  renderHelp(): string {
    return [
      'A fellow student once gave you this advice:',
      '',
      '  look / look around   — take in your surroundings',
      '  go [direction]       — move north, south, east, west, up, down, in, out, enter',
      '  wait                 — let time pass',
      '  status / stats       — check your condition and finances',
      '  inventory / inv / i  — see what you are carrying',
      '',
      '  eat                  — spend 3 drabs on a meal',
      '  sleep / rest         — sleep where you are (must have a bed)',
      '  busk / play / perform — play for coin at Anker\'s',
      '  pay tuition          — pay what you owe the University',
      '',
      '  talk to [name]       — speak with someone present',
      '  ask [name] about [topic]',
      '',
      '  use sympathy         — attempt a sympathetic binding',
      '  bind [source] to [target]',
      '  sympathy status      — check your alar and warmth',
      '  buy [item]           — purchase materials at the Fishery',
      '',
      '  ask kilvin for work  — request a Fishery shift',
      '  work fishery         — complete an approved shift',
      '  ignore ambrose       — do not engage',
      '  answer ambrose carefully',
      '  answer ambrose sharply',
      '',
      '  audition for pipes   — attempt an Eolian audition',
      '  play at eolian       — perform if you have earned the pipes',
      '',
      '  help                 — this list',
      '  quit / exit          — leave',
    ].join('\n');
  }

  renderSceneFromContext(context: NarrationSceneContext): string {
    const engineLine = context.engine_truth.movement_message
      ?? context.engine_truth.sympathy_outcome
      ?? context.engine_truth.social_outcome
      ?? context.engine_truth.music_outcome
      ?? '';

    const locationLine = `--- ${context.location_summary.name} ---\n${context.location_summary.description_base}`;
    return engineLine ? `${engineLine}\n${locationLine}` : locationLine;
  }
}
