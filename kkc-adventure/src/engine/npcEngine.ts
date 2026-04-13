import Database from 'better-sqlite3';
import { NPC, NPCProfile, PlayerState } from '../types';
import { NPC_PROFILES } from '../content/npcProfiles';
import { getNPCsAtLocation } from './movement';

export function getNPCProfile(npc_id: string): NPCProfile | null {
  return NPC_PROFILES[npc_id] ?? null;
}

export function isNPCPresent(npc: NPC, state: PlayerState): boolean {
  return npc.location_id === state.location_id;
}

export function talkToNPC(
  npc_id: string,
  topic: string | null,
  state: PlayerState,
  db: Database.Database,
): string {
  const npcs = getNPCsAtLocation(db, state.location_id);
  const npc = npcs.find(n => n.id === npc_id);

  if (!npc) {
    const profile = getNPCProfile(npc_id);
    const name = profile?.name ?? npc_id;
    return `${name} isn't here right now.`;
  }

  const profile = getNPCProfile(npc_id);
  if (!profile) {
    return `${npc.name} regards you briefly but says nothing of note.`;
  }

  const greeting = profile.greeting_pool[state.day_number % profile.greeting_pool.length];

  if (!topic) {
    return greeting;
  }

  const topicLower = topic.toLowerCase();

  const isTaboo = profile.taboo_topics.some(t => topicLower.includes(t.toLowerCase()));
  if (isTaboo) {
    switch (npc_id) {
      case 'simmon':
        return `${greeting}\n\nSimmon's expression shifts slightly. "That's not something I talk about." He leaves no room for negotiation.`;
      case 'wilem':
        return `${greeting}\n\nWilem gives you a flat look. "Not that." The subject is closed.`;
      case 'anker':
        return `${greeting}\n\nAnker wipes the bar. "I don't get into people's business." That's all he says.`;
      case 'kilvin':
        return `${greeting}\n\nKilvin's expression doesn't change. "That is not a subject for the Fishery floor." He returns his gaze to his work.`;
      case 'ambrose':
        return `${greeting}\n\nAmbrose smiles. It doesn't reach his eyes. "How like you to raise that here."`;
      case 'deoch':
        return `${greeting}\n\nDeoch gives you a pleasant but firm look. "I'm afraid I can't help you there." The door on that topic closes politely but firmly.`;
      case 'stanchion':
        return `${greeting}\n\nStanchion shakes his head once. "That's not how we do things here." He moves on.`;
      default:
        return `${greeting}\n\n${npc.name} doesn't want to discuss that.`;
    }
  }

  const isKnown = profile.known_topics.some(t =>
    topicLower.includes(t.toLowerCase()) || t.toLowerCase().includes(topicLower),
  );

  if (isKnown) {
    const response = getTopicResponse(npc_id, topicLower, state);
    return `${greeting}\n\n${response}`;
  }

  return `${greeting}\n\n${npc.name} doesn't have much to say about that.`;
}

function getTopicResponse(npc_id: string, topic: string, state: PlayerState): string {
  if (npc_id === 'simmon') {
    if (topic.includes('tuition')) return 'Sim lowers his voice slightly. "It\'s brutal this term, honestly. I paid mine early just to stop thinking about it. Have you sorted yours?"';
    if (topic.includes('music') || topic.includes('lute')) return '"You should play at Anker\'s more. People notice." He seems to genuinely mean it.';
    if (topic.includes('wilem') || topic.includes('wil')) return '"He\'s around. You know Wil — you\'ll find him where the work is."';
    if (topic.includes('class')) return '"Masters Kilvin had us running calculations yesterday for two hours. My hand still aches." He flexes his fingers to prove it.';
    return '"I don\'t know much about that, honestly. But I\'m here if you need to think it through out loud."';
  }

  if (npc_id === 'wilem') {
    if (topic.includes('archive')) return '"Access requires standing. You know this." He doesn\'t say it unkindly, just directly.';
    if (topic.includes('money') || topic.includes('drabs')) return '"Count what you have. Spend only what you can spare. This is not complicated." He pauses. "Though I know it feels complicated."';
    if (topic.includes('class')) return '"The work is the work. You do it or you fall behind. Better to do it."';
    if (topic.includes('kilvin') || topic.includes('fishery')) return '"Kilvin expects honesty over cleverness. Remember that."';
    return '"I\'ve said what I know about it."';
  }

  if (npc_id === 'anker') {
    if (topic.includes('work') || topic.includes('shift')) return '"I can use you for an evening shift if you\'re sober and reliable. Two drabs and a meal. Don\'t be late."';
    if (topic.includes('room') || topic.includes('sleep')) return '"Two jots a night. Clean enough. No trouble after midnight."';
    if (topic.includes('meal') || topic.includes('food')) return '"Three drabs for a plate. Nothing fancy but it\'ll hold you."';
    return '"Don\'t know much about that. Drink?"';
  }

  if (npc_id === 'kilvin') {
    if (topic.includes('work') || topic.includes('fishery')) return '"There is always work here for careful hands. But I watch how students work before I trust them with materials. Carelessness here has consequences."';
    if (topic.includes('material') || topic.includes('sympathy')) return '"Sympathy is not a shortcut. Every action has a cost. This is not philosophy — this is engineering."';
    if (topic.includes('discipline')) return '"Discipline is not restriction. Discipline is what allows the work to be done without harm to yourself or others."';
    return '"Ask a question with a clear answer and I will give you one."';
  }

  if (npc_id === 'ambrose') {
    if (topic.includes('rank') || topic.includes('archive')) return '"Your standing speaks for itself," he says pleasantly. "Or rather, it doesn\'t speak at all."';
    if (topic.includes('noble')) return '"Some families have been connected to the University for generations," he says. "Others find their way here through... other means."';
    return '"How interesting that you\'d bring that up here."';
  }

  if (npc_id === 'deoch') {
    if (topic.includes('pipes') || topic.includes('talent')) return '"They\'re earned here. Stanchion decides. What I can tell you is that the bar is high and the Eolian doesn\'t apologise for it."';
    if (topic.includes('music') || topic.includes('player')) return '"We get good players through. And occasionally, we get someone who makes the room go quiet." He says it simply, as a fact.';
    if (topic.includes('imre') || topic.includes('eolian')) return '"Imre has its own rhythm. Looser than the University, but don\'t mistake loose for easy."';
    return '"Come back when you\'ve had a chance to look around. Then we\'ll have more to talk about."';
  }

  if (npc_id === 'stanchion') {
    if (topic.includes('pipes') || topic.includes('audition')) return '"You want to audition, you find a time when I\'m not busy and you ask properly. We judge on what we hear, nothing else. Pipes are earned."';
    if (topic.includes('rule') || topic.includes('perform')) return '"Play well, don\'t cause trouble, and we\'ll get along fine. That covers most of it."';
    return '"Talk to Deoch if you\'re looking for conversation. I\'m working."';
  }

  return '';
}

export function parseNPCCommand(
  input: string,
): { npc_id: string; topic: string | null } | null {
  const lower = input.trim().toLowerCase();

  // "ask [name] about [topic]"
  const askAbout = lower.match(/^ask\s+(\w+)\s+about\s+(.+)$/);
  if (askAbout) {
    return { npc_id: askAbout[1], topic: askAbout[2].trim() };
  }

  // "talk to [name] about [topic]"
  const talkAbout = lower.match(/^(?:talk|speak)\s+to\s+(\w+)\s+about\s+(.+)$/);
  if (talkAbout) {
    return { npc_id: talkAbout[1], topic: talkAbout[2].trim() };
  }

  // "talk to [name]" / "speak to [name]"
  const talkTo = lower.match(/^(?:talk|speak)\s+to\s+(\w+)$/);
  if (talkTo) {
    return { npc_id: talkTo[1], topic: null };
  }

  return null;
}
