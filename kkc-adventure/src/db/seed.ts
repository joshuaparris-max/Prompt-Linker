import 'dotenv/config';
import Database from 'better-sqlite3';
import { runMigrations } from './schema';

export function runSeed(db: Database.Database): void {
  runMigrations(db);

  // ── Locations (Prompt 1 — 5 base locations) ──────────────────────────
  const locations = [
    {
      id: 'university_mains',
      name: 'the Mains',
      era: 'university',
      tier: 1,
      cluster_id: 'university',
      description_base: 'The central building of the University sprawls around you, its stone corridors joining workshops and lecture halls in a familiar tangle. Students move through with purpose, heads down against the chill.',
      exits: JSON.stringify([
        { direction: 'north', target_location_id: 'university_artificery' },
        { direction: 'east', target_location_id: 'university_archives_exterior' },
        { direction: 'south', target_location_id: 'university_medica' },
        { direction: 'west', target_location_id: 'university_courtyard' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 5,
    },
    {
      id: 'university_artificery',
      name: 'the Artificery',
      era: 'university',
      tier: 1,
      cluster_id: 'university',
      description_base: 'The smell of metal and hot oil is constant here. Students work at benches with the careful attention of people handling things that can hurt them. The noise is steady and purposeful.',
      exits: JSON.stringify([
        { direction: 'south', target_location_id: 'university_mains' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 5,
    },
    {
      id: 'university_archives_exterior',
      name: 'the Archives, outer steps',
      era: 'university',
      tier: 1,
      cluster_id: 'university',
      description_base: 'Wide stone steps lead up to the Archives. The building offers no windows and no warmth; its face is plain and deliberate. Students come and go in quiet ones and twos.',
      exits: JSON.stringify([
        { direction: 'west', target_location_id: 'university_mains' },
        { direction: 'enter', target_location_id: 'university_archives_stacks', access_condition: 'requires_Re_lar' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 5,
    },
    {
      id: 'university_archives_stacks',
      name: 'the Stacks',
      era: 'university',
      tier: 1,
      cluster_id: 'university',
      description_base: 'The Stacks stretch further than they should. The shelves are close and the light is dim. The silence has weight here, a presence in itself.',
      exits: JSON.stringify([
        { direction: 'out', target_location_id: 'university_archives_exterior' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 5,
    },
    {
      id: 'university_medica',
      name: 'the Medica',
      era: 'university',
      tier: 1,
      cluster_id: 'university',
      description_base: 'The Medica smells of herbs and clean linen. There is a steadiness here that comes from people who spend their days with illness and do not flinch from it.',
      exits: JSON.stringify([
        { direction: 'north', target_location_id: 'university_mains' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 5,
    },
    // ── Prompt 2 locations ──────────────────────────────────────────────
    {
      id: 'university_mews_room',
      name: "Kvothe's room, the Mews",
      era: 'university',
      tier: 1,
      cluster_id: 'university',
      description_base: 'Your room is small enough that you can touch both walls without fully extending your arms. A bed, a desk, a single shuttered window. It is yours, and that is enough.',
      exits: JSON.stringify([
        { direction: 'out', target_location_id: 'university_mews_corridor' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 2,
    },
    {
      id: 'university_mews_corridor',
      name: 'the Mews corridor',
      era: 'university',
      tier: 2,
      cluster_id: 'university',
      description_base: 'A narrow corridor lined with doors, the wood scuffed at shoulder height from years of passing students. It is never quiet for long.',
      exits: JSON.stringify([
        { direction: 'in', target_location_id: 'university_mews_room' },
        { direction: 'south', target_location_id: 'university_courtyard' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 3,
    },
    {
      id: 'university_courtyard',
      name: 'the University courtyard',
      era: 'university',
      tier: 1,
      cluster_id: 'university',
      description_base: 'An open square of worn cobblestone, crosshatched by the paths of hundreds of students. Wind finds it easily. People cross it quickly when it is cold.',
      exits: JSON.stringify([
        { direction: 'north', target_location_id: 'university_mews_corridor' },
        { direction: 'east', target_location_id: 'university_mains' },
        { direction: 'west', target_location_id: 'university_ankers' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 4,
    },
    {
      id: 'university_ankers',
      name: "Anker's inn",
      era: 'university',
      tier: 1,
      cluster_id: 'university',
      description_base: "Anker's is warm and smells of ale and old wood. It is not elegant, but it is reliable. Students come for the cheap food, the cheap rooms, and the occasional live music.",
      exits: JSON.stringify([
        { direction: 'east', target_location_id: 'university_courtyard' },
        { direction: 'west', target_location_id: 'university_riverside_road' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 5,
    },
    {
      id: 'university_fishery_outer',
      name: 'the Fishery, outer workspace',
      era: 'university',
      tier: 1,
      cluster_id: 'university',
      description_base: 'Heat radiates from the furnaces even at the workspace edge. Students work at long benches, faces set in concentration. The smell of hot metal and flux is ordinary here.',
      exits: JSON.stringify([
        { direction: 'south', target_location_id: 'university_mains' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 5,
    },
    {
      id: 'university_mains_hall',
      name: 'the Mains, lecture hall',
      era: 'university',
      tier: 1,
      cluster_id: 'university',
      description_base: 'Rows of benches slope toward a low platform. The hall holds thirty students comfortably. Chalk dust and old wood are the constant smell.',
      exits: JSON.stringify([
        { direction: 'out', target_location_id: 'university_mains' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 3,
    },
    // ── Prompt 5 locations ──────────────────────────────────────────────
    {
      id: 'university_riverside_road',
      name: 'the riverside road',
      era: 'university',
      tier: 2,
      cluster_id: 'university',
      description_base: 'A worn road follows the water westward. The river is audible before it is visible, a steady sound beneath the wind. Students and tradespeople share the path.',
      exits: JSON.stringify([
        { direction: 'east', target_location_id: 'university_ankers' },
        { direction: 'west', target_location_id: 'stonebridge' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 10,
    },
    {
      id: 'stonebridge',
      name: 'Stonebridge',
      era: 'university',
      tier: 1,
      cluster_id: 'river_crossing',
      description_base: 'The bridge is wide and solid, stone worn smooth by years of crossing feet. The river moves below with indifference. Crossing it, you feel the shift between one world and another.',
      exits: JSON.stringify([
        { direction: 'east', target_location_id: 'university_riverside_road' },
        { direction: 'west', target_location_id: 'imre_fountain_square' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 8,
    },
    {
      id: 'imre_fountain_square',
      name: 'the square before the Eolian',
      era: 'university',
      tier: 1,
      cluster_id: 'imre',
      description_base: "A fountain stands at the square's center, its water catching the light. The streets here are looser than the University side, the air carrying music and the smell of food from nearby stalls.",
      exits: JSON.stringify([
        { direction: 'east', target_location_id: 'stonebridge' },
        { direction: 'west', target_location_id: 'eolian_exterior' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 5,
    },
    {
      id: 'eolian_exterior',
      name: 'outside the Eolian',
      era: 'university',
      tier: 1,
      cluster_id: 'imre',
      description_base: 'The Eolian stands here with quiet confidence. Its entrance is lit in the evening, and the sound of music drifts through the walls. During the day the doors are closed.',
      exits: JSON.stringify([
        { direction: 'east', target_location_id: 'imre_fountain_square' },
        { direction: 'enter', target_location_id: 'eolian_floor', access_condition: 'open_evening' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 3,
    },
    {
      id: 'eolian_floor',
      name: 'the Eolian',
      era: 'university',
      tier: 1,
      cluster_id: 'imre',
      description_base: 'The Eolian is warm and full. Voices compete with the music without drowning it. The audience pays genuine attention; this is not a room that tolerates mediocrity.',
      exits: JSON.stringify([
        { direction: 'out', target_location_id: 'eolian_exterior' },
      ]),
      is_accessible: 1,
      travel_time_minutes: 3,
    },
  ];

  const insertLocation = db.prepare(`
    INSERT OR IGNORE INTO locations
      (id, name, era, tier, cluster_id, description_base, exits, is_accessible, travel_time_minutes)
    VALUES
      (@id, @name, @era, @tier, @cluster_id, @description_base, @exits, @is_accessible, @travel_time_minutes)
  `);

  for (const loc of locations) {
    insertLocation.run(loc);
  }

  // ── NPCs ──────────────────────────────────────────────────────────────
  const npcs = [
    // Prompt 2
    {
      id: 'simmon',
      name: 'Simmon',
      location_id: 'university_ankers',
      era: 'university',
      temperament: 'warm, perceptive, genuinely decent, not naive',
      speech_style: 'easy and direct, quick to laugh, notices things others miss, does not pry but does not ignore distress either',
    },
    {
      id: 'wilem',
      name: 'Wilem',
      location_id: 'university_mains',
      era: 'university',
      temperament: 'reserved, loyal, sceptical, economical with words',
      speech_style: 'brief, dry, Siaru accent shapes his phrasing, rarely volunteers information, trust runs deep once given',
    },
    {
      id: 'anker',
      name: 'Anker',
      location_id: 'university_ankers',
      era: 'university',
      temperament: 'practical, tolerant, neither warm nor cold',
      speech_style: 'functional, inn-keeper terse, fair but not generous',
    },
    // Prompt 4
    {
      id: 'kilvin',
      name: 'Kilvin',
      location_id: 'university_fishery_outer',
      era: 'university',
      temperament: 'grave, methodical, practical, morally serious',
      speech_style: 'measured, formal, heavily accented Aturan, sparse praise, direct disapproval when warranted',
    },
    {
      id: 'ambrose',
      name: 'Ambrose',
      location_id: 'university_archives_exterior',
      era: 'university',
      temperament: 'arrogant, cutting, entitled, socially dangerous',
      speech_style: 'coldly amused, status-conscious, dismissive, sharp in public, cruel when crossed',
    },
    // Prompt 5
    {
      id: 'deoch',
      name: 'Deoch',
      location_id: 'eolian_floor',
      era: 'university',
      temperament: 'social, observant, seasoned, careful without seeming stiff',
      speech_style: 'easy, polished, attentive, capable of warmth but not foolish',
    },
    {
      id: 'stanchion',
      name: 'Stanchion',
      location_id: 'eolian_floor',
      era: 'university',
      temperament: 'practical, fair-minded, busy, good judge of performance',
      speech_style: 'plainspoken, steady, hospitable but brisk when working',
    },
  ];

  const insertNPC = db.prepare(`
    INSERT OR IGNORE INTO npcs (id, name, location_id, era, temperament, speech_style)
    VALUES (@id, @name, @location_id, @era, @temperament, @speech_style)
  `);

  for (const npc of npcs) {
    insertNPC.run(npc);
  }
}

if (require.main === module) {
  runSeed(require('./connection').default);
  console.log('Database seeded.');
}
