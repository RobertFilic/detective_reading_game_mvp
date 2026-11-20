// Loaded by run.mjs before every test (node --import).
// 1. Screenshots are for looking, not for checking: no test reads them back, so they are skipped unless
//    the run asks for them (SHOTS=1, run.mjs --shots).
// 2. A test ends with browser.close(). On a busy computer Chrome sometimes never confirms it, or node stays
//    up afterwards, so the test would hang after its last check: close gets 15 s, then Chrome is killed,
//    and the test exits once its output is written (with its own exit code).
import puppeteer from 'puppeteer-core';
const launch = puppeteer.launch.bind(puppeteer);
// 4. On a computer without the Mac's Chrome (Linux, CI), use CHROME or /usr/bin/google-chrome instead, without the sandbox
import fs from 'node:fs';
puppeteer.launch = async (o = {}) => {
  if (o.executablePath && !fs.existsSync(o.executablePath)) {
    o = { ...o, executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: [...(o.args || []), '--no-sandbox'] };
  }
  const b = await launch(o), newPage = b.newPage.bind(b), close = b.close.bind(b);
  b.newPage = async () => {
    const p = await newPage();
    if (!process.env.SHOTS) p.screenshot = async () => {};
    // 3. TEST_DATE=2026-11-27 runs the pages on that day (a test that fakes its own clock still wins: it is injected later)
    if (process.env.TEST_DATE) await p.evaluateOnNewDocument((day) => { const D = Date, t = new D(`${day}T09:00:00`).getTime() - D.now();
      window.Date = class extends D { constructor(...a) { super(...(a.length ? a : [D.now() + t])); } static now() { return D.now() + t; } }; }, process.env.TEST_DATE);
    return p;
  };
  b.close = async () => {
    await Promise.race([close(), new Promise(r => setTimeout(r, 15e3).unref())]);
    const chrome = b.process();
    if (chrome && chrome.exitCode === null) chrome.kill('SIGKILL');
    process.stdout.write('', () => process.stderr.write('', () => process.exit()));
  };
  return b;
};
