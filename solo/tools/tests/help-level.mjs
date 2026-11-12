// The help level (docs/WARMUP_AND_HELP.md §3): how a case is judged, how the level moves after real cases,
// a new kind of step judged on its own, and the adult's »Detektivi in pomoč« block in the review.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) process.exitCode = 1; };
const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
const kid = { av: '🕵🏽‍♀️', g: 'f', sk: '🦊', name: 'Ana', id: '1234' };
const state = (o = {}) => JSON.stringify({ v: 2, g: 1, over: null, warm: 'done', streak: 0, skills: {}, hist: [], ...o });

async function open(storage, w = 1024, h = 768) {
  const p = await b.newPage();
  p.errors = []; p.on('pageerror', e => p.errors.push(e.message));
  p.on('dialog', d => d.accept());
  await p.setViewport({ width: w, height: h, hasTouch: true, deviceScaleFactor: 1 });
  await p.goto('http://localhost:8765/solo/?play');
  await p.evaluate((st) => { localStorage.clear(); for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v); }, storage);
  await p.reload(); await wait(400);
  p.help = () => p.evaluate(() => JSON.parse(localStorage.getItem('dp_help_v1')));
  return p;
}
const base = { dp_save_version: '4', dp_profile_v1: JSON.stringify(kid) };

// ---- the verdict, from a run's counters
{
  const p = await open({ ...base, dp_help_v1: state() });
  const verdict = (steps, over, coin = 0) => p.evaluate((steps, over, coin) => helpVerdict(stepStats({ steps }, { ...newRun(), ...over }), coin), steps, over, coin);
  const S3 = ['call', 'scene', 'solve'];
  for (const [name, steps, over, coin, want] of [
    ['nothing wrong', S3, {}, 0, 'clean'],
    ['one wrong pair', S3, { wrong: 1 }, 0, 'clean'],
    ['one hint asked from the coin', S3, { rung: 1, coin: 1 }, 1, 'clean'],
    ['two hints from the coin', S3, { rung: 2 }, 2, 'helped'],
    ['two wrong pairs (the case\'s hint)', S3, { wrong: 2, rung: 1 }, 0, 'helped'],
    ['three wrong pairs', S3, { wrong: 3, rung: 2 }, 0, 'helped'],
    ['four wrong pairs', S3, { wrong: 4, rung: 3, assisted: true }, 0, 'hard'],
    ['the answer from the coin, no wrong pair', S3, { rung: 3, assisted: true }, 3, 'hard'],
    ['the lock: one wrong code', ['call', 'lock', 'scene', 'solve'], { kwrong: 1 }, 0, 'clean'],
    ['the lock: its hint (2 wrong codes)', ['call', 'lock', 'scene', 'solve'], { kwrong: 2 }, 0, 'helped'],
    ['the lock: the code given (4 wrong)', ['call', 'lock', 'scene', 'solve'], { kwrong: 4 }, 0, 'hard'],
    ['wrong tries add up across steps (2 + 2)', ['call', 'scene', 'when', 'solve'], { wmiss: 2, wrong: 2, rung: 1 }, 0, 'hard'],
    ['told where to look in two steps', ['call', 'words', 'scene', 'lie', 'solve'], { wwrong: 0, lwrong: 3, rung: 2, wrong: 0 }, 0, 'hard'],
    ['UGOVOR shown the answer', ['call', 'scene', 'lie', 'solve'], { lassisted: true }, 0, 'hard'],
    ['a puzzle hint from the coin', ['call', 'cipher', 'scene', 'solve'], { coined: ['cipher'] }, 1, 'clean'],
  ]) {
    const got = await verdict(steps, over, coin);
    ok(got === want, `${name} → ${want}${got === want ? '' : ' (got ' + got + ')'}`);
  }

  // ---- the level moves: hard → up at once; two clean in a row → down; helped keeps it and breaks the row
  const after = (id, steps, over, coin = 0) => p.evaluate((id, steps, over) => { helpAfterCase({ id, steps }, { ...newRun(), ...over }); return help(); }, id, steps, over);
  await p.evaluate((s) => localStorage.setItem('dp_help_v1', s), state({ g: 2, skills: { scene: { n: 3, hard: false } } }));
  let h = await after('x1', S3, {});
  ok(h.g === 2 && h.streak === 1, 'level 2, one clean case: stays 2 (one in a row)');
  h = await after('x2', S3, { wrong: 2, rung: 1 });
  ok(h.g === 2 && h.streak === 0, 'a helped case keeps the level and breaks the row');
  h = await after('x3', S3, {}); h = await after('x4', S3, {});
  ok(h.g === 1 && h.streak === 0, 'two clean cases in a row: down to 1');
  h = await after('x5', S3, {}); h = await after('x6', S3, {});
  ok(h.g === 1, 'never below 1');
  h = await after('x7', S3, { wrong: 4, rung: 3, assisted: true });
  ok(h.g === 2 && h.streak === 0, 'one hard case: up to 2 at once');
  h = await after('x8', S3, { wrong: 4, rung: 3, assisted: true }); h = await after('x9', S3, { wrong: 5, rung: 3, assisted: true });
  ok(h.g === 3 && h.hist.length === 8 && h.hist[7].c === 'x9' && h.hist[7].v === 'hard', 'one notch a case, never above 3; the last 8 cases are kept');
  ok(await p.evaluate(() => LOG.filter(e => e.type === 'help_level').length === 9 && LOG.filter(e => e.type === 'help_level').pop().to === 3), 'every move is logged (help_level)');

  // ---- a new kind of step is judged on its own
  await p.evaluate((s) => localStorage.setItem('dp_help_v1', s), state({ g: 1, skills: { scene: { n: 2, hard: false } } }));
  h = await after('y1', ['call', 'scene', 'lie', 'solve'], { lwrong: 3 });
  ok(h.g === 1 && h.streak === 1 && h.skills.lie.n === 1 && h.skills.lie.hard, 'the first UGOVOR with 3 wrong tries: the level stays, the case counts as clean, UGOVOR is marked hard');
  h = await after('y2', ['call', 'scene', 'lie', 'solve'], { lwrong: 3, streak: 0 });
  ok(h.skills.lie.n === 2 && h.skills.lie.hard && h.streak === 0, 'the second UGOVOR counts for the level (3 wrong: helped) and stays hard');
  h = await after('y3', ['call', 'scene', 'lie', 'solve'], {});
  ok(!h.skills.lie.hard && h.skills.lie.n === 3, 'one clean UGOVOR clears the mark');
  ok(!p.errors.length, `no page errors ${p.errors.join('|')}`);
  await p.close();
}

// ---- a detective from before: the steps of the cases already solved are not new (also for a state saved by the first version)
for (const [name, extra] of [['no help state yet', {}], ['a v1 state without skills', { dp_help_v1: JSON.stringify({ v: 1, g: 1, over: null, warm: 'legacy', streak: 0, skills: {}, hist: [] }) }]]) {
  const p = await open({ ...base, dp_tutorial_done: 'true', dp_played_v1: JSON.stringify(['bip:1', 'bip:2', 'bip:4']), ...extra });
  const h = await p.help();
  ok(h.v === 2 && h.warm === 'legacy' && h.skills.scene.n === 2 && h.skills.ask.n === 1 && h.skills.words.n === 1 && !h.skills.lie, `${name}: scene, questioning and word search are known, UGOVOR is still new`);
  await p.close();
}

// ---- a real case: solved alone it is clean; solved again it says nothing new
{
  const p = await open({ ...base, dp_help_v1: state({ g: 2, skills: { scene: { n: 2, hard: false } } }) });
  const pair = async (sid, who) => { await p.click(`.row[data-sid="${sid}"]`); await wait(50); await p.click(`.suspect[data-id="${who}"]`); await wait(150); if (await p.$('#note')) await p.click('[data-act="noteOk"]'); };
  const play = async () => {
    await p.evaluate(() => { S.file = 'bip'; playCase(1); }); await wait(100);
    await p.click('[data-act="answer"]'); await p.click('[data-act="toScene"]'); await wait(100); await p.click('[data-act="briefOk"]');
    await p.click('[data-act="torch"]');
    for (const sid of await p.$$eval('.obj', els => els.map(e => e.dataset.sid))) { await p.click(`.obj[data-sid="${sid}"]`); await wait(60); if (await p.$('#note')) await p.click('[data-act="noteOk"]'); }
    await p.click('[data-act="toSolve"]'); await wait(100); await p.click('[data-act="briefOk"]');
    await pair('s3', 'kiki'); await pair('s5', 'robi'); await pair('s7', 'ela'); await pair('s4', 'tim');
  };
  await play();
  let h = await p.help();
  ok(await p.evaluate(() => S.screen === 'reveal' && S.run.help === 2) && h.g === 2 && h.streak === 1 && h.hist.length === 1 && h.hist[0].c === 'b1' && h.hist[0].g === 2 && h.hist[0].v === 'clean', 'bip 1 solved alone at level 2: clean, one in a row, in the history');
  ok(await p.evaluate(() => LOG.some(e => e.type === 'case_done' && e.help === 2)), 'case_done says the level the case began with');
  await play();
  h = await p.help();
  ok(h.streak === 1 && h.hist.length === 1, 'the same case solved again changes nothing');

  // ---- the adult's block in the review
  await p.evaluate(() => go('debrief')); await wait(200);
  const row = () => p.$eval('.helpblock tr[data-det]', e => e.innerText.replace(/\s+/g, ' '));
  ok((await row()).includes('Ana') && (await row()).includes('Nekaj pomoči (2)') && (await p.$$('.help-trail .tag.c-good')).length === 1 && (await p.$eval('.help-warm', e => e.innerText)) === 'končana', 'the review: the detective, »Nekaj pomoči (2)«, one green case, the warm-up');
  ok((await p.$eval('table tr.clickable td:last-child', e => e.innerText)).startsWith('2 ·'), 'the session table says the level per case');
  await p.screenshot({ path: 'shots/help-review.png' });
  await p.click('[data-act="helpOver"][data-n="3"]'); await wait(100);
  ok((await row()).includes('Veliko pomoči (3)') && (await row()).includes('samodejno bi bilo 2') && await p.evaluate(() => helpLevel() === 3 && help().g === 2), 'the adult picks 3: »Veliko pomoči (3)«, »samodejno bi bilo 2«');
  await p.evaluate(() => { S.file = 'bip'; playCase(2); });
  ok(await p.evaluate(() => S.run.help === 3), 'the next case starts at 3');
  await p.evaluate(() => go('debrief')); await wait(100);
  await p.click('[data-act="helpOver"][data-n="0"]'); await wait(100);
  ok(await p.evaluate(() => helpLevel() === 2 && help().over === null), '»Samodejno« gives the level back to the game');
  await p.click('[data-act="warmAgain"]'); await wait(100);
  ok((await p.help()).warm === 'new' && (await p.$eval('.help-warm', e => e.innerText)) === 'še ni začeta' && await p.$('[data-act="warmOff"]') && await p.evaluate(() => localStorage.getItem('dp_played_v1').includes('bip:1')), '»Ponovi vajo«: the warm-up waits again, the solved cases stay');
  await p.click('[data-act="resume"]'); await wait(300);
  ok(await p.evaluate(() => S.screen === 'call' && S.c.id === 'w1'), '»Nadaljuj igro« starts the warm-up');
  await p.evaluate(() => go('debrief')); await wait(100);
  await p.click('[data-act="warmOff"]'); await wait(100); await p.click('[data-act="resume"]'); await wait(300);
  ok((await p.help()).warm === 'skipped' && await p.evaluate(() => S.screen === 'files'), '»Preskoči vajo«: back to the adventures');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth) && !p.errors.length, `no sideways scroll, no page errors ${p.errors.join('|')}`);
  await p.close();
}

// ---- two detectives: the one not playing is read from and written to their own copy
{
  const ema = { dp_profile_v1: JSON.stringify({ av: '🕵🏼‍♀️', g: 'f', sk: '🐱', name: 'Ema', id: '4321' }), dp_played_v1: '["bip:1"]', dp_tutorial_done: 'true' };
  const p = await open({ ...base, dp_help_v1: state({ g: 3, wv: 'hard' }),
    dp_detectives_v1: JSON.stringify({ active: 'd1', list: [{ key: 'd1', data: null }, { key: 'd2', data: ema }] }) }, 390, 844);
  await p.evaluate(() => go('debrief')); await wait(200);
  const rows = await p.$$eval('.helpblock tr[data-det]', els => els.map(e => e.innerText.replace(/\s+/g, ' ')));
  ok(rows.length === 2 && rows[0].includes('Ana') && rows[0].includes('Veliko pomoči (3)') && rows[0].includes('z veliko pomoči') && rows[1].includes('Ema') && rows[1].includes('Malo pomoči (1)') && rows[1].includes('ni je bilo'), 'two detectives: Ana at 3 after a hard warm-up, Ema from before at 1');
  await p.click('tr[data-det="d2"] [data-act="helpOver"][data-n="2"]'); await wait(100);
  ok(await p.evaluate(() => help().g === 3 && help().over === null && JSON.parse(JSON.parse(localStorage.getItem('dp_detectives_v1')).list[1].data.dp_help_v1).over === 2), 'Ema\'s level is changed in her own copy, Ana\'s is untouched');
  await p.evaluate(() => { switchDetective('d2'); });
  ok(await p.evaluate(() => helpLevel() === 2 && help().warm === 'legacy' && help().skills.scene.n === 1), 'when Ema plays, her level is 2 and her solved steps are known');
  ok(await p.evaluate(() => document.querySelector('.helpblock .tablewrap').scrollWidth >= 0 && document.documentElement.scrollWidth <= innerWidth) && !p.errors.length, `on a phone the page doesn't scroll sideways (the table scrolls in its own box) ${p.errors.join('|')}`);
  await p.close();
}
await b.close();
