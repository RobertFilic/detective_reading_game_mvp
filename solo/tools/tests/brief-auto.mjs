// For the older tests: the »Najprej navodilo« cards are read at once (»Razumem« / truth), and a message
// card is closed before the next tap. brief.mjs tests the cards themselves without this.
import puppeteer from 'puppeteer-core';
const launch = puppeteer.launch.bind(puppeteer);
puppeteer.launch = async (o) => {
  const b = await launch(o), newPage = b.newPage.bind(b);
  b.newPage = async () => {
    const p = await newPage();
    await p.evaluateOnNewDocument(() => { window.NO_READ_WAIT = true; });   // "all found" comes at once (bip.mjs tests the wait)
    await p.evaluateOnNewDocument(() => {
      new MutationObserver(() => { const k = document.querySelector('[data-act="briefOk"], [data-act="truthOk"], [data-act="excuseOk"]'); if (k) k.click(); })
        .observe(document, { childList: true, subtree: true });
    });
    const click = p.click.bind(p);
    p.click = async (sel, opt) => {
      if (!/noteOk|noteNudge/.test(sel)) await p.evaluate(() => { const n = document.querySelector('[data-act="noteOk"]'); if (n) n.click(); });
      return click(sel, opt);
    };
    return p;
  };
  return b;
};
