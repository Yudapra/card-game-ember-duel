// Ember Duel — render: every screen is plain DOM, no canvas.
//
// The table is built from the engine state each time it changes, so the
// screenshots always show the real game: readable card values, both hands,
// life totals, energy and the log. Cards are DOM so their text stays crisp
// at any window size; the layout is a fixed 960x600 stage scaled to fit,
// which is also what the screenshots capture.

import { CARD_BY_ID, RIVALS, RULES, SUITS } from './cards.js';
import { rivalDef, scoreLine } from './engine.js';
import { isMuted } from './audio.js';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function lifeBar(fighter) {
  const pct = Math.max(0, Math.round((fighter.life / fighter.maxLife) * 100));
  const cls = pct > 50 ? 'good' : pct > 25 ? 'warn' : 'bad';
  return `<div class="lifebar"><div class="lifefill ${cls}" style="width:${pct}%"></div>`
    + `<span class="lifenums">${fighter.life} / ${fighter.maxLife}</span></div>`;
}

function statusChips(fighter) {
  let out = '';
  if (fighter.shield > 0) out += `<span class="chip shield">🛡️ ${fighter.shield} shield</span>`;
  if (fighter.burn > 0) out += `<span class="chip burn">🔥 ${fighter.burn} burn</span>`;
  return out;
}

// One card face. `index` (1-based) is the keyboard key that plays it;
// `playable` false dims it and says why (not enough energy).
export function cardHTML(card, opts = {}) {
  const suit = SUITS[card.suit];
  const playable = opts.playable !== false;
  const key = opts.index ? `<span class="key">${opts.index}</span>` : '';
  const vals = [];
  if (card.atk) vals.push(`<span class="val atk">⚔️ ${card.atk}</span>`);
  if (card.shd) vals.push(`<span class="val shd">🛡️ ${card.shd}</span>`);
  if (card.heal) vals.push(`<span class="val heal">💚 ${card.heal}</span>`);
  if (card.draw) vals.push(`<span class="val draw">🎴 +${card.draw}</span>`);
  if (card.energy) vals.push(`<span class="val energy">⚡ +${card.energy}</span>`);
  if (card.burn) vals.push(`<span class="val burn">🔥 ${card.burn}</span>`);
  return `<button class="card suit-${card.suit}${playable ? '' : ' disabled'}" data-card="${card.id}" `
    + `style="--suit:${suit.color};--suit-dark:${suit.dark}" ${playable ? '' : 'disabled'}>`
    + `<span class="cost" title="Energy cost">${card.cost}</span>${key}`
    + `<span class="suitline"><span class="glyph">${suit.glyph}</span><span class="suitname">${suit.name}</span></span>`
    + `<span class="cardname">${esc(card.name)}</span>`
    + `<span class="values">${vals.join('')}</span>`
    + `<span class="ruletext">${esc(card.text)}</span>`
    + `<span class="flavor">${esc(card.flavor)}</span></button>`;
}

function cardBackHTML(count) {
  let backs = '';
  for (let i = 0; i < Math.min(count, 7); i += 1) {
    backs += `<span class="cardback" style="--i:${i}">🔥</span>`;
  }
  return `<div class="handbacks">${backs}<span class="backcount">${count} cards</span></div>`;
}

function energyPips(game) {
  let pips = '';
  for (let i = 0; i < game.energyMax; i += 1) {
    pips += `<span class="pip${i < game.energy ? ' on' : ''}">⚡</span>`;
  }
  return `<div class="energy" title="Energy — refills to ${game.energyMax} every turn">${pips}<span class="energynum">${game.energy}/${game.energyMax}</span></div>`;
}

function logHTML(game) {
  const lines = game.log.slice(-6);
  return `<div class="log">${lines.map((l) => `<div>${esc(l)}</div>`).join('')}</div>`;
}

function topBar(game, label) {
  return `<div class="topbar"><span class="crumb">🔥 EMBER DUEL</span>`
    + `<span class="crumb">${esc(label)}</span>`
    + `<span class="spacer"></span>`
    + `<button class="mini" data-act="mute">${isMuted() ? '🔇 Muted' : '🔊 Sound'}</button>`
    + `<button class="mini" data-act="help">? How to play</button>`
    + `<button class="mini" data-act="restart">↻ Restart</button></div>`;
}

export function renderTitle(game) {
  const ladder = RIVALS.map((r, i) => {
    const beaten = i < game.rivalIndex;
    return `<div class="rival-row${beaten ? ' beaten' : ''}">`
      + `<span class="rival-glyph">${r.glyph}</span>`
      + `<span class="rival-name">${i + 1}. ${esc(r.name)}</span>`
      + `<span class="rival-title">${esc(r.title)}</span>`
      + `<span class="rival-life">❤️ ${r.life}</span>`
      + `<span class="rival-state">${beaten ? '✓ Beaten' : i === game.rivalIndex ? '— Next' : '— Locked'}</span></div>`;
  }).join('');
  return `<div class="screen title-screen">
    ${topBar(game, 'Title')}
    <div class="hero">
      <div class="hero-ember">🔥</div>
      <h1>EMBER DUEL</h1>
      <p class="tagline">40 spells · 4 suits · 3 rivals · 1 ember throne</p>
      <p class="intro">You are the last ember-mage of the Ashen Court. Three rivals hold the
      road to the Ember Throne. Outdraw them, outplay them, and take back the fire.</p>
      <button class="big" data-act="play">▶ &nbsp;Play — Duel ${game.rivalIndex + 1} of 3</button>
      <p class="hint">Mouse: click a card to play it · Keys: 1–7 play a card, Space ends the turn, R restarts</p>
    </div>
    <div class="ladder"><h2>The road to the throne</h2>${ladder}</div>
    <div class="foot">Turn-based card duel · No luck beyond the draw · Burn, shield, chain and draft your way up</div>
  </div>`;
}

export function renderDuel(game) {
  const rival = rivalDef(game);
  const hand = game.player.hand.map((id, i) => {
    const card = CARD_BY_ID[id];
    return cardHTML(card, { playable: game.phase === 'player' && card.cost <= game.energy, index: i + 1 });
  }).join('');
  const phaseText = game.phase === 'player'
    ? `Your turn — play cards, then end your turn`
    : `${rival.name} is thinking…`;
  return `<div class="screen duel-screen">
    ${topBar(game, `Duel ${game.rivalIndex + 1} of 3 · Turn ${game.turn}`)}
    <div class="table">
      <div class="side rival-side">
        <div class="portrait" style="--pc:${rival.color}">${rival.glyph}</div>
        <div class="sideinfo">
          <div class="sidename">${esc(rival.name)} <span class="sidetitle">${esc(rival.title)}</span></div>
          ${lifeBar(game.rival)}
          <div class="chips">${statusChips(game.rival)}</div>
        </div>
        <div class="sidecards">${cardBackHTML(game.rival.hand.length)}
          <div class="deckinfo">🎴 Deck ${game.rival.deck.length} · Discard ${game.rival.discard.length}</div></div>
      </div>
      <div class="midrow">
        <div class="phase">${esc(phaseText)}</div>
        ${logHTML(game)}
      </div>
      <div class="side player-side">
        <div class="portrait you" style="--pc:#ffb300">🧙</div>
        <div class="sideinfo">
          <div class="sidename">You <span class="sidetitle">Ember-Mage of the Ashen Court</span></div>
          ${lifeBar(game.player)}
          <div class="chips">${statusChips(game.player)}</div>
        </div>
        <div class="sidecards">
          ${energyPips(game)}
          <div class="deckinfo">🎴 Deck ${game.player.deck.length} · Discard ${game.player.discard.length} · Score ${game.score}</div>
        </div>
      </div>
      <div class="handrow">${hand || '<div class="emptyhand">No cards in hand.</div>'}</div>
      <div class="actions">
        <button class="big endturn" data-act="endturn" ${game.phase === 'player' ? '' : 'disabled'}>End turn ⏎</button>
        <span class="actionhint">Chain: play two cards of the same suit in one turn and the second deals +2 damage.</span>
      </div>
    </div>
  </div>`;
}

export function renderDraft(game) {
  const choices = game.draft.map((id) => {
    const card = CARD_BY_ID[id];
    return `<div class="draft-pick">${cardHTML(card, { playable: true })}`
      + `<button class="big pick" data-draft="${id}">Draft this card</button></div>`;
  }).join('');
  return `<div class="screen draft-screen">
    ${topBar(game, 'Draft — choose your reward')}
    <div class="draftbox">
      <h2>🏆 Rival beaten — ${esc(RIVALS[game.rivalIndex - 1].name)} falls!</h2>
      <p class="draftsub">Your deck grows. Choose one card to add to it before the next duel.</p>
      <div class="draftrow">${choices}</div>
      <p class="hint">${esc(scoreLine(game))}</p>
    </div>
  </div>`;
}

export function renderWon(game) {
  return `<div class="screen end-screen won">
    ${topBar(game, 'Victory')}
    <div class="endbox">
      <div class="endglyph">👑</div>
      <h1>THE EMBER THRONE IS YOURS</h1>
      <p class="endtext">Pip, Mara and Gorrum all bow to the new Ember-Mage. The fire is yours to keep.</p>
      <div class="scoretable">
        <div><span>Score</span><b>${game.score}</b></div>
        <div><span>Damage dealt</span><b>${game.damageDealt}</b></div>
        <div><span>Cards played</span><b>${game.cardsPlayed}</b></div>
        <div><span>Embers earned</span><b>${game.embers}</b></div>
        <div><span>Deck size</span><b>${game.deck.length} cards</b></div>
      </div>
      <button class="big" data-act="play">▶ &nbsp;Play again</button>
      <p class="hint">Press R to start a new campaign.</p>
    </div>
  </div>`;
}

export function renderLost(game) {
  const rival = rivalDef(game);
  return `<div class="screen end-screen lost">
    ${topBar(game, 'Defeat')}
    <div class="endbox">
      <div class="endglyph">🥀</div>
      <h1>YOUR EMBER GOES OUT</h1>
      <p class="endtext">${esc(rival.name)} stands over your fallen ember. The throne waits for
      another challenger — sharpen your deck and come back.</p>
      <div class="scoretable">
        <div><span>Score</span><b>${game.score}</b></div>
        <div><span>Damage dealt</span><b>${game.damageDealt}</b></div>
        <div><span>Cards played</span><b>${game.cardsPlayed}</b></div>
        <div><span>Rivals beaten</span><b>${game.rivalIndex} of 3</b></div>
        <div><span>Fell on turn</span><b>${game.turn}</b></div>
      </div>
      <button class="big" data-act="play">↻ &nbsp;Try again</button>
      <p class="hint">Press R to start a new campaign.</p>
    </div>
  </div>`;
}

export function renderHelp() {
  return `<div class="overlay">
    <div class="helpbox">
      <h2>How to play Ember Duel</h2>
      <p><b>Goal.</b> Reduce each rival's life to 0. Beat all three rivals to claim the Ember Throne.</p>
      <p><b>Your turn.</b> You draw 2 cards and get 3 energy. Click a card (or press 1–7) to play it.
      Each card costs energy. Press Space or End turn when you are done; the rival then plays.</p>
      <p><b>Cards.</b> Every card shows its cost (top right), its suit, and its numbers:
      ⚔️ damage, 🛡️ shield, 💚 healing, 🎴 cards drawn, ⚡ energy gained, 🔥 burn stacks.
      Burn hurts at the start of the turn, ignoring shield.</p>
      <p><b>Ember Chain.</b> Play two cards of the same suit in one turn and the second deals +2 damage.</p>
      <p><b>Draft.</b> After each rival falls, pick 1 of 3 cards to add to your deck for the next duel.</p>
      <p><b>Suits.</b> 🔥 Flame hits hard · ❄️ Frost shields and heals · 🍃 Gale draws and energises · 🌿 Thorn burns.</p>
      <button class="big" data-act="closehelp">Got it — back to the duel</button>
    </div>
  </div>`;
}

export function render(game) {
  const app = document.getElementById('app');
  let html = '';
  if (game.screen === 'title') html = renderTitle(game);
  else if (game.screen === 'duel') html = renderDuel(game);
  else if (game.screen === 'draft') html = renderDraft(game);
  else if (game.screen === 'won') html = renderWon(game);
  else if (game.screen === 'lost') html = renderLost(game);
  app.innerHTML = html;
  if (game.showHelp) app.insertAdjacentHTML('beforeend', renderHelp());
}
