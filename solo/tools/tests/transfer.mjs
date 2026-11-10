// Moving to another address (a custom domain): export on one origin, import on another.
// localhost and 127.0.0.1 are different origins, so their localStorage is separate, like two domains.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'detektiv-'));

const kid = { av: '🕵🏻‍♂️', g: 'm', sk: '🐶', name: 'Klai', id: '9745' };
const other = { dp_profile_v1: JSON.stringify({ av: '🕵🏼‍♀️', g: 'f', sk: '🐱', name: 'Ema', id: '1234' }), dp_played_v1: '["bip:1"]' };
const OLD = 'http://localhost:8765/solo/', NEW = 'http://127.0.0.1:8765/solo/';

// --- old address: a device with two detectives, solved cases and a log
const a = await b.newPage();
const errors = []; a.on('pageerror', e => errors.push(e.message));
await a.goto(OLD);
await a.evaluate((kid, other) => {
  localStorage.clear();
  localStorage.setItem('dp_save_version', '4');
  localStorage.setItem('dp_tutorial_done', 'true');
  localStorage.setItem('dp_profile_v1', JSON.stringify(kid));
  localStorage.setItem('dp_played_v1', JSON.stringify(['bip:1', 'bip:2', 'galeb:1']));
  localStorage.setItem('dp_detectives_v1', JSON.stringify({ active: 'd1', list: [{ key: 'd1', data: null }, { key: 'd2', data: other }] }));
  localStorage.setItem('dp_child_n', '3');
  localStorage.setItem('dp_log_v1', JSON.stringify([
    { ts: 1, session: 's1', type: 'session_start', case: null },
    { ts: 2, session: 's1', type: 'screen_enter', case: 'bip:1', screen: 'story' },
  ]));
}, kid, other);
await a.reload(); await wait(400);
const data = await a.evaluate(() => exportData());
ok(data.version === 2 && data.events.length === 2, 'export has version 2 and the log');
ok(data.storage.dp_profile_v1 && data.storage.dp_detectives_v1 && data.storage.dp_played_v1, 'export carries profile, all detectives and solved cases');
ok(!('dp_log_v1' in data.storage), 'the log is not stored twice');
const file = path.join(tmp, 'detektiv.json');
fs.writeFileSync(file, JSON.stringify(data));

// --- new address: empty device, import through the real button and file picker
const p = await b.newPage();
p.on('pageerror', e => errors.push(e.message));
const dialogs = []; p.on('dialog', d => { dialogs.push(d.message()); d.accept(); });
await p.goto(NEW);
await p.evaluate(() => localStorage.clear());
await p.reload(); await wait(400);
await p.evaluate(() => go('debrief'));
ok(!!await p.$('[data-act=importLog]'), 'debrief has an "Uvozi JSON" button');
const importFile = async (f) => {
  const [chooser] = await Promise.all([p.waitForFileChooser(), p.click('[data-act=importLog]')]);
  await Promise.all([p.waitForNavigation({ timeout: 5000 }).catch(() => null), chooser.accept([f])]);
  await wait(400);
};
await importFile(file);
const after = await p.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])));
for (const k of ['dp_profile_v1', 'dp_played_v1', 'dp_detectives_v1', 'dp_tutorial_done']) {
  ok(after[k] === data.storage[k], `new address has the same ${k}`);
}
ok(JSON.parse(after.dp_log_v1).length === 2, 'new address has the log');
ok(after.dp_child_n === '3', 'child codes continue from the old device');
ok(dialogs.some(m => m.startsWith('Uvoženo: 2 novih')), `the adult is told what came in (${dialogs.at(-1)})`);

// importing the same file again adds no duplicate events and asks before replacing the detective
dialogs.length = 0;
await p.evaluate(() => go('debrief'));
await importFile(file);
ok(dialogs.some(m => m.startsWith('Na tej napravi že je detektiv')), 'asks before replacing a detective already here');
ok(await p.evaluate(() => JSON.parse(localStorage.getItem('dp_log_v1')).length) === 2, 'a second import adds no duplicates');

// a version 1 file (only the active child's progress) still restores that child
const v1 = { app: 'detektivska-pisarna', version: 1, exported: 'x', progress: { saveVersion: 4, profile: kid, solved: ['bip:1'], tutorialDone: true, player: { id: 'p-1' } }, events: [] };
const v1file = path.join(tmp, 'v1.json');
fs.writeFileSync(v1file, JSON.stringify(v1));
await p.evaluate(() => localStorage.clear());
await p.reload(); await wait(400);
await p.evaluate(() => go('debrief'));
await importFile(v1file);
ok(await p.evaluate(() => JSON.parse(localStorage.getItem('dp_profile_v1')).name) === 'Klai', 'a version 1 file restores the child');
ok(await p.evaluate(() => JSON.parse(localStorage.getItem('dp_played_v1')).join()) === 'bip:1', 'a version 1 file restores solved cases');

// a file that is not an export changes nothing
const bad = path.join(tmp, 'bad.json');
fs.writeFileSync(bad, '{"hello": 1}');
dialogs.length = 0;
await p.evaluate(() => go('debrief'));
await importFile(bad);
ok(dialogs.some(m => m.startsWith('To ni izvoz')), 'a wrong file is refused');
ok(await p.evaluate(() => JSON.parse(localStorage.getItem('dp_profile_v1')).name) === 'Klai', 'a wrong file changes nothing');

ok(!errors.length, `no page errors ${errors}`);
fs.rmSync(tmp, { recursive: true, force: true });
await b.close();
