import readline from 'readline';
import Database from 'better-sqlite3';
import { NarrationProvider } from './types';
import { loadPlayerState, savePlayerState, initDefaultPlayerState } from './engine/state';
import { getLocation, getNPCsAtLocation, getAccessibleExits } from './engine/movement';
import { dispatch } from './engine/actions';

const WELCOME =
  'You wake in your room at the Mews to the usual grey light of a University morning. ' +
  'The day has no shape yet, only the usual weight of what it will require. ' +
  'You dress without thinking about it, reach for whatever is close, and face the room. ' +
  'The day begins, as all days do, with the simple fact of beginning it.';

export function startREPL(db: Database.Database, narrator: NarrationProvider): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  const loaded = loadPlayerState(db);
  let state = loaded ?? initDefaultPlayerState();
  if (!loaded) {
    savePlayerState(db, state);
  }

  console.log(WELCOME);
  console.log();

  const location = getLocation(db, state.location_id);
  if (location) {
    const npcs = getNPCsAtLocation(db, state.location_id);
    const exits = getAccessibleExits(location, state);
    console.log(narrator.renderLocation(location, state, npcs, exits));
  }

  rl.prompt();

  rl.on('line', async (line: string) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    try {
      const result = await dispatch(input, state, db, narrator);
      console.log();
      console.log(result.output);
      console.log();

      if (result.shouldExit) {
        rl.close();
        return;
      }

      state = result.newState;
      savePlayerState(db, state);
    } catch (err) {
      console.error('An error occurred:', err);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
}
