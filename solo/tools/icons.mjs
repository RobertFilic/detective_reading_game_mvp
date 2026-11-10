// Usage (from solo/, once: cd tools && npm install):
//   node tools/icons.mjs     renders icons/icon.svg to the PNGs the pages and the manifest use
// icon-180 (iOS home screen), icon-192 and icon-512 (manifest, also the tab icon), and
// icon-maskable-512: the art shrunk into Android's safe circle (centre 80 %) on full-bleed green.
// The »?« is set in the game's Lexend. Needs Google Chrome (CHROME=path to override).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const svg = fs.readFileSync(path.join(ROOT, 'icons/icon.svg'), 'utf8');
const font = fs.readFileSync(path.join(ROOT, 'solo/fonts/lexend-sl.woff2')).toString('base64');
const maskable = svg.replace('<g id="art">', '<g id="art" transform="translate(10 10) scale(.8)">');

const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage();
for (const [name, size, art] of [['icon-180', 180, svg], ['icon-192', 192, svg], ['icon-512', 512, svg], ['icon-maskable-512', 512, maskable]]) {
  await p.setViewport({ width: size, height: size });
  await p.setContent(`<style>@font-face{font-family:Lexend;font-weight:100 900;src:url(data:font/woff2;base64,${font})}
    html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${art}`);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(ROOT, `icons/${name}.png`), omitBackground: false });
  console.log(`icons/${name}.png`);
}
await b.close();
