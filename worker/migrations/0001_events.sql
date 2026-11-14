-- Anonymous game events (docs/EVENTS.md). No names, no IP, no device ID: `sid` is a random number that
-- lives in the page's memory for one sitting and is gone on reload.
CREATE TABLE IF NOT EXISTS events (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  day    TEXT    NOT NULL,              -- UTC date, e.g. 2026-11-14 (no time of day)
  sid    TEXT    NOT NULL,              -- one sitting
  game   TEXT    NOT NULL,              -- 'sobe' (Skrivnostne sobe)
  ev     TEXT    NOT NULL,              -- intro | start | wrong | hint | stuck | solved | left
  puzzle INTEGER,                       -- puzzle number, 1–12
  placed INTEGER,                       -- people on the board when it happened
  sec    INTEGER,                       -- seconds since the puzzle opened
  data   TEXT                           -- small JSON with the event's own fields
);
CREATE INDEX IF NOT EXISTS events_day ON events (day, ev, puzzle);
