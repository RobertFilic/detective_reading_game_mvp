// The site is static files (assets). This Worker runs only for /api/*: it takes the anonymous game
// events (docs/EVENTS.md) and writes them to D1. It keeps only the fields listed below; it never reads
// or stores the IP address, the user agent or anything else about the visitor.

const GAMES = new Set(['sobe']);
const EVENTS = new Set(['intro', 'start', 'wrong', 'hint', 'stuck', 'solved', 'left']);
// allowed keys inside `data`, each a small number, a boolean or a short word
const DATA = new Set(['card', 'how', 'first', 'who', 'kind', 'step', 'hints', 'wrongs', 'undos', 'notes', 'done', 'new', 'tries']);
const KEEP_DAYS = 365;

const int = (v, lo, hi) => (Number.isInteger(v) && v >= lo && v <= hi ? v : null);

function clean(e) {
  if (!e || typeof e !== 'object') return null;
  if (!GAMES.has(e.game) || !EVENTS.has(e.ev)) return null;
  if (typeof e.sid !== 'string' || !/^[a-z0-9]{8,16}$/.test(e.sid)) return null;
  const data = {};
  if (e.data && typeof e.data === 'object') {
    for (const [key, v] of Object.entries(e.data)) {
      if (!DATA.has(key)) continue;
      if (typeof v === 'boolean' || int(v, 0, 9999) !== null) data[key] = v;
      else if (typeof v === 'string' && /^[a-z0-9_-]{1,16}$/i.test(v)) data[key] = v;
    }
  }
  return {
    sid: e.sid, game: e.game, ev: e.ev,
    puzzle: int(e.puzzle, 1, 99), placed: int(e.placed, 0, 9), sec: int(e.sec, 0, 86400),
    data: Object.keys(data).length ? JSON.stringify(data) : null,
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/e') return new Response('Not found', { status: 404 });
    if (request.method !== 'POST') return new Response(null, { status: 405 });
    // only our own pages send events
    const origin = request.headers.get('Origin');
    if (origin) {
      let host = '';
      try { host = new URL(origin).hostname; } catch {}
      const bare = (h) => h.replace(/^www\./, '');
      if (bare(host) !== bare(url.hostname) && !/^(localhost|127\.0\.0\.1)$/.test(host)) return new Response(null, { status: 403 });
    }
    const text = await request.text();
    if (text.length > 8000) return new Response(null, { status: 413 });
    let body;
    try { body = JSON.parse(text); } catch { return new Response(null, { status: 400 }); }
    const rows = (Array.isArray(body) ? body : [body]).slice(0, 30).map(clean).filter(Boolean);
    if (rows.length) {
      const day = new Date().toISOString().slice(0, 10);
      const stmt = env.DB.prepare('INSERT INTO events (day, sid, game, ev, puzzle, placed, sec, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      const work = env.DB.batch(rows.map(r => stmt.bind(day, r.sid, r.game, r.ev, r.puzzle, r.placed, r.sec, r.data)));
      // now and then, forget events older than a year
      const old = Math.random() < 0.01
        ? env.DB.prepare("DELETE FROM events WHERE day < date('now', ?)").bind(`-${KEEP_DAYS} days`).run()
        : null;
      ctx.waitUntil(Promise.all([work, old]).catch(() => {}));
    }
    return new Response(null, { status: 204 });
  },
};
