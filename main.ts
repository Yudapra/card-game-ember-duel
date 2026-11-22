// Ember Duel — the entrypoint (Node 22, standard library only).
//
// The grader runs this file as `node /bot/main.ts` with no network, a
// read-only repository at /bot and an empty writable directory at /output.
// All it does is hand the game in: copy the static game/ folder and the
// screenshots/ folder into the output directory, then write dossier.json
// with the kit's vendored library — the summary (screenshots plus a source
// outline) the AI judge reads. Nothing here is random or time-dependent, so
// two runs produce the same output byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  const gameDir = join(repoRoot, 'game');
  if (!existsSync(gameDir)) throw new Error('game/ is missing from the repository');
  cpSync(gameDir, join(outputDir, 'game'), { recursive: true });
  const shots = join(repoRoot, 'screenshots');
  if (existsSync(shots)) {
    mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
    cpSync(shots, join(outputDir, 'screenshots'), { recursive: true });
  }
  // The scorer's caps for this competition: at most 160 KiB of dossier
  // text, 4 screenshots of at most 256 KiB each, at most 993 files and
  // 48 MiB under game/, no game/ path longer than 1000 bytes.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handIn();
