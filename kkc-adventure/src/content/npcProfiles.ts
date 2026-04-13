import { NPCProfile } from '../types';

export const NPC_PROFILES: Record<string, NPCProfile> = {
  simmon: {
    id: 'simmon',
    name: 'Simmon',
    era: 'university',
    home_location_id: 'university_ankers',
    temperament: 'warm, perceptive, genuinely decent, not naive',
    speech_style: 'easy and direct, quick to laugh, notices things others miss',
    known_topics: ['classes', 'tuition', 'students', 'music', 'wilem', 'university gossip', 'how kvothe is doing'],
    taboo_topics: ['his family', 'money', 'noble background'],
    greeting_pool: [
      "Sim looks up from his mug with a quick smile. \"You look like you've been at it already. Sit down if you've a moment.\"",
      "\"There you are,\" Sim says, shifting to make room. \"I was starting to think you'd gotten lost in the stacks again.\"",
      "Simmon glances over with the easy attention of someone who notices more than he lets on. \"You all right? You've got that look.\"",
    ],
    exit_lines: [
      '"I should get back to it. Don\'t disappear entirely."',
      'He gives a brief nod, already turning back to his work.',
    ],
  },

  wilem: {
    id: 'wilem',
    name: 'Wilem',
    era: 'university',
    home_location_id: 'university_mains',
    temperament: 'reserved, loyal, sceptical, economical with words',
    speech_style: 'brief, dry, Siaru cadence, rarely volunteers information',
    known_topics: ['classes', 'cealdim customs', 'money', 'archives', "kilvin's fishery work"],
    taboo_topics: ['personal family matters', 'siaru home life'],
    greeting_pool: [
      "Wilem looks at you with steady, dark eyes. \"You needed something,\" he says. It is not quite a question.",
      'He acknowledges you with a slight tilt of his head. A Cealdim greeting, brief and without ceremony.',
      "\"Kvothe.\" He says your name the way he says most things — as if it costs something and he's decided to spend it anyway.",
    ],
    exit_lines: [
      'He nods once, which means the conversation is done.',
      '"Work to do." He turns back to it.',
    ],
  },

  anker: {
    id: 'anker',
    name: 'Anker',
    era: 'university',
    home_location_id: 'university_ankers',
    temperament: 'practical, tolerant, neither warm nor cold',
    speech_style: 'functional, inn-keeper terse, fair but not generous',
    known_topics: ['rooms', 'meals', 'work shifts', 'local gossip', "what's available at the inn"],
    taboo_topics: ["students' private business"],
    greeting_pool: [
      'Anker sets down the cloth he was using and looks at you with the patience of a man who has dealt with students for thirty years.',
      '"What do you need?" he asks, not unkindly.',
      'He glances up from the bar. "Still here, then. What\'ll it be?"',
    ],
    exit_lines: [
      'He goes back to whatever he was doing, which appears to be everything at once.',
      '"Right," he says, which closes the conversation.',
    ],
  },

  kilvin: {
    id: 'kilvin',
    name: 'Kilvin',
    era: 'university',
    home_location_id: 'university_fishery_outer',
    temperament: 'grave, methodical, practical, morally serious',
    speech_style: 'formal, precise, accented Aturan, judges skill and judgment together',
    known_topics: ['artificing', 'sympathy safety', 'work', 'materials', 'discipline', 'university reputation'],
    taboo_topics: ['private life', 'gossip', 'naming', 'noble politics'],
    greeting_pool: [
      "Kilvin looks up from his work without haste. \"Re'lar Kvothe. You are here for a reason, I think.\"",
      'He sets his tools down with deliberate care before acknowledging you. The pause is not unfriendly — it is respectful. He expects the same.',
      "\"You have a question,\" Kilvin says, returning his gaze to the work in front of him. \"Ask it plainly.\"",
    ],
    exit_lines: [
      '"There is work to return to. You know where to find me."',
      'He picks up his tools again. The conversation is complete.',
    ],
  },

  ambrose: {
    id: 'ambrose',
    name: 'Ambrose',
    era: 'university',
    home_location_id: 'university_archives_exterior',
    temperament: 'arrogant, cutting, entitled, socially dangerous',
    speech_style: 'smooth when it suits him, contemptuous when crossed, public-facing cruelty',
    known_topics: ['rank', 'admissions', 'the archives', 'nobles', 'student gossip', 'kvothe'],
    taboo_topics: ['apology', 'weakness', 'consequences for his own behaviour'],
    greeting_pool: [
      'Ambrose looks at you the way a man looks at something inconvenient that has appeared on his path.',
      '"Still at the University," he says, as if this fact disappoints him on behalf of the institution.',
      'He doesn\'t quite look at you. "I see you\'ve managed to keep yourself enrolled," he says to no one in particular.',
    ],
    exit_lines: [
      'He dismisses you with a gesture that costs him nothing.',
      '"Do try not to embarrass the rest of us," he says, and turns away.',
    ],
  },

  deoch: {
    id: 'deoch',
    name: 'Deoch',
    era: 'university',
    home_location_id: 'eolian_floor',
    temperament: 'social, observant, seasoned, careful without seeming stiff',
    speech_style: 'easy and polished, hospitable, notices moods, not easily rattled',
    known_topics: ['music', 'players', 'the eolian', 'imre', 'pipes'],
    taboo_topics: ['private patron business', 'gossip presented as fact', 'being pressed for secrets'],
    greeting_pool: [
      'Deoch catches your eye with the practiced ease of a man who makes everyone feel noticed. "First time?" he asks, though he probably already knows.',
      '"Come in," Deoch says, though you\'re already in. It\'s the tone that counts — warm without being familiar.',
      'He appraises you briefly before offering a greeting. Whatever he sees seems to pass his assessment. "Evening," he says.',
    ],
    exit_lines: [
      '"Enjoy the music," he says, and means it.',
      'He turns back to the room with the smooth efficiency of someone who has a hundred things to attend to.',
    ],
  },

  stanchion: {
    id: 'stanchion',
    name: 'Stanchion',
    era: 'university',
    home_location_id: 'eolian_floor',
    temperament: 'practical, fair-minded, busy, good judge of performance',
    speech_style: 'plainspoken, steady, clear, judges music without ornament',
    known_topics: ['pipes', 'auditions', 'performers', 'rules', 'the eolian'],
    taboo_topics: ['flattery', 'shortcuts', 'entitlement'],
    greeting_pool: [
      '"Yes?" Stanchion looks at you with the direct attention of someone who doesn\'t waste time.',
      'He nods. Brief, measured. He\'s listening.',
      '"What can I do for you?" His tone says he means the question practically.',
    ],
    exit_lines: [
      '"I\'ve got things to see to." He moves off with purpose.',
      '"Right." He returns to his work without ceremony.',
    ],
  },
};
