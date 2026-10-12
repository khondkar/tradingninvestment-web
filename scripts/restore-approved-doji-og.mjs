import { copyFileSync, mkdirSync } from 'node:fs';

const source = new URL('../src/assets/approved/doji-study-og.png', import.meta.url);
for (const folder of ['public', 'dist']) {
  const directory = new URL(`../${folder}/images/social/research/`, import.meta.url);
  mkdirSync(directory, { recursive: true });
  copyFileSync(source, new URL('doji-candlestick-spy-26-year-study-tni-og.png', directory));
}
console.log('Approved Doji OG restored to public and dist.');
