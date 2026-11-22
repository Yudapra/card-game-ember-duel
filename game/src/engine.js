// Ember Duel — engine: the rules, the turns, the rival AI.
//
// A duel is a plain state object: two fighters (life, shield, burn, deck,
// hand, discard), a turn counter, an energy pool and a log. No DOM lives
// here; render.js reads the state and draws it, main.js wires the input.
// The engine is deterministic for a given seed: shuffles use a small
// mulberry32 generator, so a staged screenshot replays exactly.

import { CARD_BY_ID, RIVALS, RULES, STARTER_DECK } from './cards.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function makeFighter(life, deckIds) {
  return {
    life, maxLife: life, shield: 0, burn: 0,
    deck: deckIds.slice(), hand: [], discard: [],
  };
}

// A fresh campaign: the player plus the first rival, turn 1, no cards drawn
// yet. `seed` drives every shuffle in this campaign.
export function newCampaign(seed) {
  const rng = mulberry32(seed);
  const game = {
    seed, rng,
    screen: 'title', // title | duel | draft | won | lost
    rivalIndex: 0,
    deck: STARTER_DECK.slice(), // the player's growing deck (draft adds to it)
    player: makeFighter(RULES.playerLife, []),
    rival: null,
    turn: 1,
    energy: RULES.energyPerTurn,
    energyMax: RULES.energyPerTurn,
    phase: 'player', // player | rival | over
    lastSuit: null, // suit of the last card played this turn (Ember Chain)
    chainCount: 0,
    log: [],
    draft: [], // the 3 cards offered after a rival falls
    score: 0,
    damageDealt: 0,
    cardsPlayed: 0,
    embers: 0, // gold earned across the campaign
    message: '',
  };
  startDuel(game);
  return game;
}

export function rivalDef(game) {
  return RIVALS[game.rivalIndex];
}

function drawCards(fighter, count, game) {
  for (let i = 0; i < count; i += 1) {
    if (fighter.hand.length >= RULES.handMax) break;
    if (fighter.deck.length === 0) {
      if (fighter.discard.length === 0) break;
      fighter.deck = shuffle(fighter.discard, game.rng);
      fighter.discard = [];
    }
    fighter.hand.push(fighter.deck.pop());
  }
}

export function startDuel(game) {
  const rival = rivalDef(game);
  game.rival = makeFighter(rival.life, shuffle(rival.deck, game.rng));
  game.player.life = RULES.playerLife;
  game.player.maxLife = RULES.playerLife;
  game.player.shield = 0;
  game.player.burn = 0;
  game.player.deck = shuffle(game.deck, game.rng);
  game.player.hand = [];
  game.player.discard = [];
  game.rival.hand = [];
  game.rival.discard = [];
  game.turn = 1;
  game.energy = RULES.energyPerTurn;
  game.phase = 'player';
  game.lastSuit = null;
  game.chainCount = 0;
  game.message = '';
  drawCards(game.player, RULES.handStart, game);
  drawCards(game.rival, RULES.handStart, game);
  game.log = [`Duel ${game.rivalIndex + 1} of 3 — ${rival.name} (${rival.life} life).`,
    `${rival.name}: “${rival.taunt}”`];
}

// Burn ticks at the start of a fighter's turn: X damage, ignoring shield,
// then the stacks clear by one each turn (they fade instead of stacking
// forever, so burn is pressure, not a death sentence).
function applyBurn(fighter, name, game) {
  if (fighter.burn <= 0) return;
  const dmg = fighter.burn;
  fighter.life = Math.max(0, fighter.life - dmg);
  if (fighter === game.rival) game.damageDealt += dmg;
  game.log.push(`${name} burns for ${dmg}.`);
  fighter.burn = Math.max(0, fighter.burn - 1);
}

// Damage first eats shield, then life. Returns the life damage dealt.
export function dealDamage(target, amount, game) {
  let left = amount;
  if (target.shield > 0) {
    const blocked = Math.min(target.shield, left);
    target.shield -= blocked;
    left -= blocked;
    if (blocked > 0) game.log.push(`Shield blocks ${blocked}.`);
  }
  if (left > 0) target.life = Math.max(0, target.life - left);
  return left;
}

function healFighter(fighter, amount, game) {
  const healed = Math.min(amount, fighter.maxLife - fighter.life);
  fighter.life += healed;
  return healed;
}

// Play one card from `fighter`'s hand against `enemy`. Returns false when
// the card cannot be played (not in hand, or not enough energy).
// Ember Chain: a second card of the same suit in one turn deals +2 damage.
export function playCard(game, fighter, enemy, cardId, fighterName, enemyName) {
  const at = fighter.hand.indexOf(cardId);
  if (at < 0) return false;
  const card = CARD_BY_ID[cardId];
  if (!card) return false;
  if (fighter === game.player && card.cost > game.energy) return false;
  if (fighter === game.rival && card.cost > game.rivalEnergy) return false;

  fighter.hand.splice(at, 1);
  fighter.discard.push(cardId);
  if (fighter === game.player) game.energy -= card.cost;
  else game.rivalEnergy -= card.cost;
  if (fighter === game.player) game.cardsPlayed += 1;

  let chain = 0;
  if (fighter === game.player && game.lastSuit === card.suit && card.atk > 0) {
    chain = RULES.chainBonus;
    game.chainCount += 1;
  }
  if (fighter === game.player) game.lastSuit = card.suit;

  if (card.energy) {
    if (fighter === game.player) game.energy += card.energy;
    else game.rivalEnergy += card.energy;
  }
  if (card.draw) drawCards(fighter, card.draw, game);
  if (card.shd) {
    fighter.shield += card.shd;
    game.log.push(`${fighterName} gains ${card.shd} shield (${card.name}).`);
  }
  if (card.heal) {
    const healed = healFighter(fighter, card.heal, game);
    if (healed > 0) game.log.push(`${fighterName} heals ${healed} (${card.name}).`);
  }
  if (card.burn) {
    enemy.burn += card.burn;
    game.log.push(`${enemyName} is burning (${card.burn} stacks, ${card.name}).`);
  }
  if (card.atk) {
    const total = card.atk + chain;
    const dealt = dealDamage(enemy, total, game);
    if (fighter === game.player) game.damageDealt += dealt;
    game.log.push(`${fighterName} plays ${card.name} for ${total} damage${chain ? ' (Ember Chain +2)' : ''}.`);
  } else {
    game.log.push(`${fighterName} plays ${card.name}.`);
  }
  return true;
}

export function playerPlayCard(game, cardId) {
  if (game.screen !== 'duel' || game.phase !== 'player') return false;
  const ok = playCard(game, game.player, game.rival, cardId, 'You', rivalDef(game).name);
  if (!ok) return false;
  checkDuelEnd(game);
  return true;
}

// The rival AI: scores every playable card by its style, plays the best
// while it can afford it, then passes. Aggro loves damage, Guard loves
// shield and healing when hurt, Grind loves burn and value.
function aiScore(game, cardId) {
  const card = CARD_BY_ID[cardId];
  const rival = game.rival;
  const style = rivalDef(game).style;
  let s = 0;
  if (card.atk) s += card.atk * (style === 'aggro' ? 3 : 2);
  if (card.burn) s += card.burn * (style === 'grind' ? 4 : 2);
  if (card.shd) s += card.shd * (rival.life < rival.maxLife * 0.5 ? 2.5 : 1);
  if (card.heal) s += card.heal * (rival.life < rival.maxLife * 0.6 ? 3 : 0.5);
  if (card.draw) s += 2;
  if (card.energy) s += 2;
  s -= card.cost * 1.5;
  s += game.rng() * 0.6; // a little unpredictability, seeded
  return s;
}

export function rivalTurn(game) {
  game.phase = 'rival';
  game.rivalEnergy = RULES.energyPerTurn;
  applyBurn(game.rival, rivalDef(game).name, game);
  if (checkDuelEnd(game)) return;
  drawCards(game.rival, RULES.drawPerTurn, game);
  let guard = 0;
  while (guard < 12) {
    guard += 1;
    const playable = game.rival.hand.filter((id) => CARD_BY_ID[id].cost <= game.rivalEnergy);
    if (playable.length === 0) break;
    playable.sort((a, b) => aiScore(game, b) - aiScore(game, a));
    if (aiScore(game, playable[0]) < 0.5) break;
    playCard(game, game.rival, game.player, playable[0], rivalDef(game).name, 'You');
    if (game.player.life <= 0) break;
  }
  if (checkDuelEnd(game)) return;
  startPlayerTurn(game);
}

function startPlayerTurn(game) {
  game.phase = 'player';
  game.turn += 1;
  game.energy = RULES.energyPerTurn;
  game.lastSuit = null;
  game.chainCount = 0;
  applyBurn(game.player, 'You', game);
  if (checkDuelEnd(game)) return;
  drawCards(game.player, RULES.drawPerTurn, game);
  game.log.push(`Turn ${game.turn} — your move. Draw ${RULES.drawPerTurn}, energy refilled.`);
}

export function endPlayerTurn(game) {
  if (game.screen !== 'duel' || game.phase !== 'player') return false;
  game.log.push('You end your turn.');
  rivalTurn(game);
  return true;
}

// After any damage, check whether the duel (or the campaign) is over.
export function checkDuelEnd(game) {
  if (game.rival.life <= 0) {
    const rival = rivalDef(game);
    const lifeBonus = game.player.life * RULES.scorePerLifeLeft;
    game.score += RULES.scorePerRival + lifeBonus;
    game.embers += 25 + game.player.life;
    game.log.push(`${rival.name} is beaten! +${RULES.scorePerRival} score, +${lifeBonus} life bonus.`);
    game.rivalIndex += 1;
    if (game.rivalIndex >= RIVALS.length) {
      game.screen = 'won';
      game.phase = 'over';
      game.log.push('The Ember Throne is yours.');
    } else {
      game.screen = 'draft';
      game.phase = 'over';
      const pool = shuffle(Object.keys(CARD_BY_ID).filter((id) => !game.deck.includes(id)), game.rng);
      game.draft = pool.slice(0, RULES.draftChoices);
    }
    return true;
  }
  if (game.player.life <= 0) {
    game.screen = 'lost';
    game.phase = 'over';
    game.log.push('Your ember goes out.');
    return true;
  }
  return false;
}

// Take one of the three draft cards after a rival falls, then start the
// next duel with the grown deck.
export function pickDraft(game, cardId) {
  if (game.screen !== 'draft' || !game.draft.includes(cardId)) return false;
  game.deck.push(cardId);
  game.log.push(`You draft ${CARD_BY_ID[cardId].name} into your deck.`);
  game.draft = [];
  game.screen = 'duel';
  startDuel(game);
  return true;
}

export function restartCampaign(game) {
  const fresh = newCampaign(game.seed);
  Object.keys(fresh).forEach((k) => { game[k] = fresh[k]; });
  game.screen = 'title';
  game.log = ['A new campaign. The throne is waiting.'];
}

export function scoreLine(game) {
  return `Score ${game.score} · Damage ${game.damageDealt} · Cards played ${game.cardsPlayed} · Embers ${game.embers}`;
}
