// Loaded by run.mjs before every test (node --import).
// 1. Screenshots are for looking, not for checking: no test reads them back, so they are skipped unless
//    the run asks for them (SHOTS=1, run.mjs --shots).
// 2. A test ends with browser.close(). On a busy computer Chrome sometimes never confirms it, or node stays
//    up afterwards, so the test would hang after its last check: close gets 15 s, then Chrome is killed,
//    and the test exits once its output is written (with its own exit code).
import puppeteer from 'puppeteer-core';
const launch = puppeteer.launch.bind(puppeteer);
puppeteer.launch = async (o) => {
  const b = await launch(o), newPage = b.newPage.bind(b), close = b.close.bind(b);
  if (!process.env.SHOTS) b.newPage = async () => { const p = await newPage(); p.screenshot = async () => {}; return p; };
  b.close = async () => {
    await Promise.race([close(), new Promise(r => setTimeout(r, 15e3).unref())]);
    const chrome = b.process();
    if (chrome && chrome.exitCode === null) chrome.kill('SIGKILL');
    process.stdout.write('', () => process.stderr.write('', () => process.exit()));
  };
  return b;
};
