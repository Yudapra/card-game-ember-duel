// Ember Duel — main: boot, input, and the render loop.
//
// The game is one campaign object. Every state change re-renders the DOM,
// and every sound is chosen from what actually happened (a card that dealt
// damage thuds, a shield clinks). Staged screenshots (?shot=…) build their
// scene through the same engine and renderer as live play.

import { newCampaign, playerPlayCard, endPlayerTurn, pickDraft, restartCampaign } from './engine.js';
import { render } from './render.js';
import { sfx, toggleMute } from './audio.js';
import { stageShot, shotFromURL } from './shots.js';
import { CARD_BY_ID } from './cards.js';

const staged = shotFromURL();
const game = staged ? stageShot(staged.shot, staged.seed) : newCampaign((Date.now() % 2147483647) || 1);
game.showHelp = false;

function draw() {
  render(game);
  document.title = game.screen === 'duel'
    ? `Ember Duel — Turn ${game.turn}`
    : 'Ember Duel — 40 spells, 3 rivals, 1 ember throne';
}

function soundFor(cardId) {
  const c = CARD_BY_ID[cardId];
  if (!c) return;
  if (c.atk) sfx.hit();
  if (c.shd) sfx.shield();
  if (c.heal) sfx.heal();
  if (c.burn) sfx.burn();
  if (c.draw || c.energy) sfx.draw();
}

function act(name, el) {
  if (name === 'play') {
    if (game.screen === 'won' || game.screen === 'lost') restartCampaign(game);
    game.screen = 'duel';
    sfx.turn();
  } else if (name === 'endturn') {
    if (endPlayerTurn(game)) sfx.turn();
  } else if (name === 'restart') {
    restartCampaign(game);
    sfx.turn();
  } else if (name === 'mute') {
    toggleMute();
  } else if (name === 'help') {
    game.showHelp = true;
  } else if (name === 'closehelp') {
    game.showHelp = false;
  }
  if (el && el.dataset && el.dataset.draft) {
    if (pickDraft(game, el.dataset.draft)) sfx.draft();
  }
  draw();
}

document.getElementById('app').addEventListener('click', (ev) => {
  // Clicking the dimmed area around the help box closes it; clicks inside
  // the box are handled by their own buttons.
  if (ev.target.classList && ev.target.classList.contains('overlay')) {
    game.showHelp = false;
    draw();
    return;
  }
  const cardEl = ev.target.closest('[data-card]');
  if (cardEl) {
    const id = cardEl.dataset.card;
    if (game.screen === 'duel' && playerPlayCard(game, id)) {
      sfx.playCard();
      soundFor(id);
      if (game.screen === 'won') sfx.win();
      if (game.screen === 'lost') sfx.lose();
    } else {
      sfx.bad();
    }
    draw();
    return;
  }
  const actEl = ev.target.closest('[data-act]');
  if (actEl) {
    act(actEl.dataset.act, actEl);
    return;
  }
  const draftEl = ev.target.closest('[data-draft]');
  if (draftEl) act('draft', draftEl);
});

document.addEventListener('keydown', (ev) => {
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
  const k = ev.key.toLowerCase();
  if (k === 'm') { toggleMute(); draw(); return; }
  if (k === 'h') { game.showHelp = !game.showHelp; draw(); return; }
  if (k === 'r') { restartCampaign(game); sfx.turn(); draw(); return; }
  if (game.screen === 'title' && (k === 'enter' || k === ' ')) { act('play'); return; }
  if (game.screen === 'won' || game.screen === 'lost') {
    if (k === 'enter' || k === ' ') act('play');
    return;
  }
  if (game.screen === 'duel') {
    if (k === ' ' || k === 'enter') { ev.preventDefault(); act('endturn'); return; }
    const n = Number(k);
    if (n >= 1 && n <= game.player.hand.length) {
      const id = game.player.hand[n - 1];
      if (playerPlayCard(game, id)) {
        sfx.playCard();
        soundFor(id);
        if (game.screen === 'won') sfx.win();
        if (game.screen === 'lost') sfx.lose();
      } else sfx.bad();
      draw();
    }
  }
});

draw();
