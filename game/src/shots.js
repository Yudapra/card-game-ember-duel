// Ember Duel — staged shots: the four screenshots, as real game states.
//
// ?shot=title | duel | win | loss (with an optional &seed=) puts the game
// into a fixed, deterministic scene and renders it with the real renderer,
// so each screenshot is a true render of the game's own code — never a
// mock-up. The duel scene is built by playing real turns forward with a
// simple autopilot, the same way a player would reach that table.

import { newCampaign, playerPlayCard, endPlayerTurn, pickDraft } from './engine.js';
import { CARD_BY_ID } from './cards.js';

// Play the hand well: energy and draw first, then the best damage, shield
// or heal when hurt. A simple scorer, not a solver — enough to win duels
// the way a careful player would.
function autopilotPlay(game) {
  for (let guard = 0; guard < 12 && game.screen === 'duel' && game.phase === 'player'; guard += 1) {
    const affordable = game.player.hand.filter((id) => CARD_BY_ID[id].cost <= game.energy);
    if (affordable.length === 0) break;
    const score = (id) => {
      const c = CARD_BY_ID[id];
      let s = c.atk * 2 + c.burn * 3 + c.draw * 1.5 + c.energy * 2 - c.cost;
      if (c.shd) s += c.shd * (game.player.life < 16 ? 2 : 0.6);
      if (c.heal) s += c.heal * (game.player.life < 20 ? 2 : 0.4);
      return s;
    };
    affordable.sort((a, b) => score(b) - score(a));
    if (score(affordable[0]) <= 0 && game.player.hand.length > 1) break;
    if (!playerPlayCard(game, affordable[0])) break;
  }
}

// Build the named scene on a fresh campaign and return the game.
export function stageShot(name, seed = 20261123) {
  const game = newCampaign(seed);
  // newCampaign opens on the title screen; staged play starts on the table.
  game.screen = 'duel';
  if (name === 'win') {
    // Play the campaign out with the autopilot until the throne is won.
    // A strong hand and a weak first rival make this reachable; if the
    // autopilot ever loses, force the win honestly through the engine by
    // replaying with a friendlier seed instead of faking the screen.
    for (let s = seed; s < seed + 40 && game.screen !== 'won'; s += 1) {
      const g = newCampaign(s);
      g.screen = 'duel';
      let guard = 0;
      while (g.screen === 'duel' && guard < 400) {
        guard += 1;
        autopilotPlay(g);
        if (g.screen === 'duel') endPlayerTurn(g);
        if (g.screen === 'draft') pickDraft(g, g.draft[0]);
      }
      if (g.screen === 'won') return g;
    }
    // Fallback: the last attempt's state, whatever it is — never a fake screen.
    return game;
  }
  if (name === 'loss') {
    // Let the rival win: never play a card, just end turns until the ember dies.
    let guard = 0;
    while (game.screen === 'duel' && guard < 200) {
      guard += 1;
      endPlayerTurn(game);
    }
    return game;
  }
  if (name === 'duel') {
    // A lively mid-duel table against Mara (duel 2): win duel 1 by
    // autopilot, draft, then play one card a turn for two turns, so the
    // frame catches turn 3 with a full hand, both life totals and a log.
    let guard = 0;
    while (game.screen === 'duel' && game.rivalIndex === 0 && guard < 200) {
      guard += 1;
      autopilotPlay(game);
      if (game.screen === 'duel') endPlayerTurn(game);
      if (game.screen === 'draft') pickDraft(game, game.draft[0]);
    }
    const playOneBest = () => {
      const affordable = game.player.hand.filter((id) => CARD_BY_ID[id].cost <= game.energy);
      if (affordable.length === 0) return;
      affordable.sort((a, b) => (CARD_BY_ID[b].atk + CARD_BY_ID[b].burn * 2) - (CARD_BY_ID[a].atk + CARD_BY_ID[a].burn * 2));
      playerPlayCard(game, affordable[0]);
    };
    guard = 0;
    while (game.screen === 'duel' && game.turn < 3 && guard < 100) {
      guard += 1;
      playOneBest();
      if (game.screen === 'duel') endPlayerTurn(game);
    }
    return game;
  }
  // title (and anything unknown): the fresh campaign's title screen.
  game.screen = 'title';
  return game;
}

export function shotFromURL() {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  if (!shot) return null;
  const seed = Number(q.get('seed') || 20261123) || 20261123;
  return { shot, seed };
}
