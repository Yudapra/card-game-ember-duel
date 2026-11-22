// Ember Duel — card catalogue, suits, rivals and decks.
//
// Every card in the game lives here as plain data: one object per card with
// a stable id, a suit, an energy cost and the numbers the table shows. The
// engine in engine.js only reads these fields, so new cards are data, never
// new code. All names, suits and flavour lines are original to this game.

export const SUITS = {
  flame: { name: 'Flame', glyph: '🔥', color: '#ff6b35', dark: '#c73e12', text: '#ffd9c2' },
  frost: { name: 'Frost', glyph: '❄️', color: '#4fc3f7', dark: '#1565c0', text: '#d8f1ff' },
  gale: { name: 'Gale', glyph: '🍃', color: '#66bb6a', dark: '#2e7d32', text: '#dcf5dd' },
  thorn: { name: 'Thorn', glyph: '🌿', color: '#ab47bc', dark: '#6a1b9a', text: '#f0d8f7' },
};

// A card: id, name, suit, cost (energy), atk (damage), shd (shield gained),
// heal (life restored), draw (cards drawn), energy (energy gained),
// burn (burn stacks put on the enemy). `text` is the rules line on the card,
// `flavor` the one-line story under it. atk/shd/heal/draw/energy/burn
// default to 0 when absent.
export const CARDS = [
  // ---- Flame: raw damage, ten cards ----
  { id: 'ember-spark', name: 'Ember Spark', suit: 'flame', cost: 1, atk: 3, text: 'Deal 3 damage.', flavor: 'Every bonfire starts with one spark.' },
  { id: 'cinder-fang', name: 'Cinder Fang', suit: 'flame', cost: 1, atk: 4, text: 'Deal 4 damage.', flavor: 'It bites, then it burns.' },
  { id: 'flame-lash', name: 'Flame Lash', suit: 'flame', cost: 2, atk: 6, text: 'Deal 6 damage.', flavor: 'A whip of living fire.' },
  { id: 'fireball', name: 'Fireball', suit: 'flame', cost: 2, atk: 7, burn: 1, text: 'Deal 7 damage. Burn 1.', flavor: 'Catch. It is already too late.' },
  { id: 'inferno', name: 'Inferno', suit: 'flame', cost: 3, atk: 10, burn: 2, text: 'Deal 10 damage. Burn 2.', flavor: 'The sky itself catches light.' },
  { id: 'spark-burst', name: 'Spark Burst', suit: 'flame', cost: 1, atk: 2, draw: 1, text: 'Deal 2 damage. Draw 1 card.', flavor: 'One spark finds the next.' },
  { id: 'molten-edge', name: 'Molten Edge', suit: 'flame', cost: 2, atk: 5, heal: 2, text: 'Deal 5 damage. Heal 2.', flavor: 'The blade drinks what it cuts.' },
  { id: 'ash-storm', name: 'Ash Storm', suit: 'flame', cost: 3, atk: 6, burn: 3, text: 'Deal 6 damage. Burn 3.', flavor: 'Grey snow, hot as coals.' },
  { id: 'kindle', name: 'Kindle', suit: 'flame', cost: 1, atk: 2, energy: 1, text: 'Deal 2 damage. Gain 1 energy.', flavor: 'Feed the fire and it feeds you.' },
  { id: 'phoenix-dive', name: 'Phoenix Dive', suit: 'flame', cost: 3, atk: 8, heal: 4, text: 'Deal 8 damage. Heal 4.', flavor: 'It falls burning, and rises brighter.' },

  // ---- Frost: shield and healing, ten cards ----
  { id: 'ice-wall', name: 'Ice Wall', suit: 'frost', cost: 1, shd: 5, text: 'Gain 5 shield.', flavor: 'Winter, standing between you and harm.' },
  { id: 'frost-ward', name: 'Frost Ward', suit: 'frost', cost: 1, shd: 4, heal: 2, text: 'Gain 4 shield. Heal 2.', flavor: 'Cold hands, warm heart.' },
  { id: 'glacier', name: 'Glacier', suit: 'frost', cost: 2, shd: 9, text: 'Gain 9 shield.', flavor: 'It has waited a thousand years. It can wait one more blow.' },
  { id: 'snow-mend', name: 'Snow Mend', suit: 'frost', cost: 1, heal: 6, text: 'Heal 6 life.', flavor: 'Snow closes every wound it covers.' },
  { id: 'frozen-guard', name: 'Frozen Guard', suit: 'frost', cost: 2, shd: 6, draw: 1, text: 'Gain 6 shield. Draw 1 card.', flavor: 'Still as a statue, ready as a soldier.' },
  { id: 'blizzard-veil', name: 'Blizzard Veil', suit: 'frost', cost: 3, shd: 12, burn: 1, text: 'Gain 12 shield. Burn 1.', flavor: 'The storm hides you and bites them.' },
  { id: 'crystal-bulwark', name: 'Crystal Bulwark', suit: 'frost', cost: 3, shd: 10, heal: 3, text: 'Gain 10 shield. Heal 3.', flavor: 'Clear as glass, hard as diamond.' },
  { id: 'chill-touch', name: 'Chill Touch', suit: 'frost', cost: 1, atk: 2, shd: 3, text: 'Deal 2 damage. Gain 3 shield.', flavor: 'One cold finger is enough.' },
  { id: 'winter-feast', name: 'Winter Feast', suit: 'frost', cost: 2, heal: 8, text: 'Heal 8 life.', flavor: 'Soup, firelight, and a second helping.' },
  { id: 'rime-spike', name: 'Rime Spike', suit: 'frost', cost: 2, atk: 4, shd: 4, text: 'Deal 4 damage. Gain 4 shield.', flavor: 'Icicles, thrown like javelins.' },

  // ---- Gale: draw and energy, ten cards ----
  { id: 'swift-breeze', name: 'Swift Breeze', suit: 'gale', cost: 1, draw: 2, text: 'Draw 2 cards.', flavor: 'The wind brings news, and cards.' },
  { id: 'tailwind', name: 'Tailwind', suit: 'gale', cost: 1, energy: 2, text: 'Gain 2 energy.', flavor: 'Run with it, not against it.' },
  { id: 'gale-rush', name: 'Gale Rush', suit: 'gale', cost: 2, atk: 4, draw: 1, text: 'Deal 4 damage. Draw 1 card.', flavor: 'It hits before you hear it coming.' },
  { id: 'storm-eye', name: 'Storm Eye', suit: 'gale', cost: 2, draw: 2, energy: 1, text: 'Draw 2 cards. Gain 1 energy.', flavor: 'Calm in the middle, chaos everywhere else.' },
  { id: 'zephyr-cut', name: 'Zephyr Cut', suit: 'gale', cost: 1, atk: 3, draw: 1, text: 'Deal 3 damage. Draw 1 card.', flavor: 'A paper cut from the sky.' },
  { id: 'sky-dance', name: 'Sky Dance', suit: 'gale', cost: 2, atk: 5, energy: 1, text: 'Deal 5 damage. Gain 1 energy.', flavor: 'It never lands where you expect.' },
  { id: 'whirlwind', name: 'Whirlwind', suit: 'gale', cost: 3, atk: 7, draw: 2, text: 'Deal 7 damage. Draw 2 cards.', flavor: 'Everything in the room, in the air.' },
  { id: 'feather-step', name: 'Feather Step', suit: 'gale', cost: 1, shd: 3, draw: 1, energy: 1, text: 'Gain 3 shield. Draw 1. Gain 1 energy.', flavor: 'Light feet, lighter fingers.' },
  { id: 'tempest', name: 'Tempest', suit: 'gale', cost: 3, atk: 9, text: 'Deal 9 damage.', flavor: 'The whole sky, thrown at once.' },
  { id: 'clear-skies', name: 'Clear Skies', suit: 'gale', cost: 2, heal: 5, draw: 1, text: 'Heal 5 life. Draw 1 card.', flavor: 'After the storm, the sun does the work.' },

  // ---- Thorn: burn and slow poison, ten cards ----
  { id: 'thorn-prick', name: 'Thorn Prick', suit: 'thorn', cost: 1, atk: 2, burn: 2, text: 'Deal 2 damage. Burn 2.', flavor: 'Small hole, long ache.' },
  { id: 'venom-bloom', name: 'Venom Bloom', suit: 'thorn', cost: 2, burn: 4, text: 'Burn 4.', flavor: 'Beautiful. Do not smell it.' },
  { id: 'briar-snare', name: 'Briar Snare', suit: 'thorn', cost: 1, atk: 1, burn: 2, shd: 3, text: 'Deal 1 damage. Burn 2. Gain 3 shield.', flavor: 'The hedge holds them while it stings.' },
  { id: 'spore-cloud', name: 'Spore Cloud', suit: 'thorn', cost: 2, atk: 3, burn: 3, text: 'Deal 3 damage. Burn 3.', flavor: 'Breathe in. Regret it.' },
  { id: 'root-grasp', name: 'Root Grasp', suit: 'thorn', cost: 2, atk: 4, burn: 2, heal: 2, text: 'Deal 4 damage. Burn 2. Heal 2.', flavor: 'The earth takes, and gives back.' },
  { id: 'nightshade', name: 'Nightshade', suit: 'thorn', cost: 3, atk: 6, burn: 4, text: 'Deal 6 damage. Burn 4.', flavor: 'One berry ends the argument.' },
  { id: 'thorn-mail', name: 'Thorn Mail', suit: 'thorn', cost: 2, shd: 6, burn: 2, text: 'Gain 6 shield. Burn 2.', flavor: 'Hug the cactus. Go on.' },
  { id: 'creeper-vine', name: 'Creeper Vine', suit: 'thorn', cost: 1, burn: 3, draw: 1, text: 'Burn 3. Draw 1 card.', flavor: 'It grows while you are reading this.' },
  { id: 'wither', name: 'Wither', suit: 'thorn', cost: 2, atk: 5, burn: 2, text: 'Deal 5 damage. Burn 2.', flavor: 'Green to grey in one breath.' },
  { id: 'elder-thorn', name: 'Elder Thorn', suit: 'thorn', cost: 3, atk: 7, burn: 5, text: 'Deal 7 damage. Burn 5.', flavor: 'Old as the forest, sharp as the first day.' },
];

export const CARD_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));

// The player's starting deck: 20 cards, a mix of all four suits so every
// system is in hand from the first duel.
export const STARTER_DECK = [
  'ember-spark', 'ember-spark', 'cinder-fang', 'cinder-fang', 'flame-lash',
  'fireball', 'spark-burst', 'kindle', 'ice-wall', 'ice-wall', 'frost-ward',
  'snow-mend', 'glacier', 'swift-breeze', 'swift-breeze', 'tailwind',
  'zephyr-cut', 'thorn-prick', 'briar-snare', 'venom-bloom',
];

// The three rivals of the Ember Throne campaign, in the order you face them.
// Each has its own life, deck, portrait glyph and way of choosing cards:
// Pip attacks first and asks later, Mara outlasts you, Gorrum grinds you down.
export const RIVALS = [
  {
    id: 'pip', name: 'Pip Cinderimp', title: 'The Spark Thief', glyph: '😈',
    life: 18, color: '#ff6b35', style: 'aggro',
    taunt: 'I stole the first ember. Come and take it back, slowpoke.',
    deck: ['ember-spark', 'ember-spark', 'ember-spark', 'cinder-fang', 'cinder-fang',
      'cinder-fang', 'flame-lash', 'flame-lash', 'fireball', 'fireball',
      'spark-burst', 'spark-burst', 'kindle', 'kindle', 'ash-storm'],
  },
  {
    id: 'mara', name: 'Mara Tidecaller', title: 'Keeper of the Cold Spring', glyph: '🧜',
    life: 26, color: '#4fc3f7', style: 'guard',
    taunt: 'The spring gives, and the spring takes. Mostly it takes.',
    deck: ['ice-wall', 'ice-wall', 'frost-ward', 'frost-ward', 'glacier',
      'snow-mend', 'snow-mend', 'frozen-guard', 'winter-feast', 'rime-spike',
      'chill-touch', 'blizzard-veil', 'swift-breeze', 'zephyr-cut', 'clear-skies'],
  },
  {
    id: 'gorrum', name: 'Gorrum Stone Warden', title: 'The Last Gardener', glyph: '🗿',
    life: 28, color: '#ab47bc', style: 'grind',
    taunt: 'I have outlived three thrones. Yours will be the fourth.',
    deck: ['thorn-prick', 'thorn-prick', 'venom-bloom', 'venom-bloom', 'briar-snare',
      'spore-cloud', 'root-grasp', 'nightshade', 'thorn-mail', 'thorn-mail',
      'creeper-vine', 'wither', 'elder-thorn', 'ice-wall', 'glacier'],
  },
];

// Game-wide numbers, in one place so the rules are easy to audit.
export const RULES = {
  playerLife: 30,
  energyPerTurn: 3,
  drawPerTurn: 2,
  handMax: 7,
  handStart: 4,
  chainBonus: 2, // second card of the same suit in one turn: +2 damage
  draftChoices: 3, // cards offered after each rival falls
  scorePerRival: 100,
  scorePerLifeLeft: 2,
};
