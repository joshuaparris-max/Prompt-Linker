import { Exit, Location, NPC, PlayerState } from '../types';
import { LOCATION_FLAVOUR } from '../content/locationFlavour';
import { timeLabel } from '../engine/time';

function timeIndex(time: PlayerState['time_of_day']): number {
  switch (time) {
    case 'morning': return 0;
    case 'afternoon': return 1;
    case 'evening': return 2;
    case 'night': return 3;
  }
}

function capitaliseFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function renderLocation(
  location: Location,
  state: PlayerState,
  npcs: NPC[],
  accessibleExits: Exit[],
): string {
  const lines: string[] = [];

  lines.push(`--- ${capitaliseFirst(location.name)} ---`);
  lines.push(location.description_base);

  const flavourLines = LOCATION_FLAVOUR[location.id];
  if (flavourLines && flavourLines.length > 0) {
    const idx = (state.day_number + timeIndex(state.time_of_day)) % flavourLines.length;
    lines.push(flavourLines[idx]);
  }

  lines.push(`It is ${timeLabel(state.time_of_day)}.`);

  if (accessibleExits.length === 0) {
    lines.push('There is no obvious way out.');
  } else if (accessibleExits.length === 1) {
    lines.push(`You could go ${accessibleExits[0].direction}.`);
  } else {
    const dirs = accessibleExits.map(e => e.direction);
    const last = dirs.pop();
    lines.push(`You could go ${dirs.join(', ')} or ${last}.`);
  }

  if (npcs.length > 0) {
    for (const npc of npcs) {
      lines.push(`${npc.name} is here.`);
    }
  }

  return lines.join('\n');
}
