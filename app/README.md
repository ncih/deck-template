# Presenter ops guide

## The three pages
1. **Deck** — `deck.html`. Your slides. Keyboard: `←/→` `Space` `PgUp/PgDn` `Home/End`; swipe on touch; `#n` in the URL jumps to slide *n*.
2. **Attendees** — a QR pointing at `index.html` (the GitHub Pages URL). Phones only need a browser.
3. **Live view** — open `presenter.html` in a second browser tab and full-screen it (F11 / ⌃⌘F). It polls every 4 seconds. Switch to it at each reveal moment.

## Gating — you pace the room
- Attendees can't run ahead: any checkpoint beyond the one you've opened shows a **waiting screen** that polls every 5s and unlocks itself.
- **Control strip at the top of `presenter.html`:** "Open next →" advances the gate by one; the **CP chips** jump the gate directly (including backwards).
- Start of session: gate should read **CP0**. Cue each checkpoint verbally, then hit **Open next**.
- **Fail-open by design:** if a phone can't reach Supabase, the gate does NOT block it — better a moving phone than a stuck one.

## Live Q&A
- Attendees get a floating **"Ask a question"** button once registered. Questions land in the **Q&A panel** newest-first, with name + company.
- **Tap a question to mark it answered** (it dims; tap again to un-dim). The header counts *unanswered*.
- Press **Q** to blow the Q&A feed up full-screen.

## Keys (presenter view)
**0–N** focus one checkpoint panel full-screen (the reveal moment) · **Q** full-screen Q&A · **Esc** back to the grid.

## Data & export
- Shared tables (one project, all decks), every row tagged with this deck's `event`: `pres_leads` (registrations, insert-only), `pres_answers` (one row per device per checkpoint, plus a `done` row on finish), `pres_questions` (Q&A), `pres_state` (the gate — one row per event).
- Export this session's leads: `select * from public.pres_leads where event = '<your-event>';` (Dashboard → SQL Editor → export CSV). A `done` row for a device = finished the full flow.
- Multi-select answers are stored as arrays and tallied per-option on the room map.

## Fallback ladder (if something looks wrong mid-session)
1. **Room map empty / frozen:** check the laptop's own Wi-Fi first — attendee writes are fire-and-forget and catch up. "Reconnecting…" self-heals.
2. **Attendee phone offline:** answers queue locally (sync dot goes amber) and sync when back online. A reloaded phone resumes where it was (localStorage).
3. **Gate won't budge on phones:** the waiting screen re-checks every 5s. If Supabase is down, phones fail open and simply aren't blocked — pace verbally.
4. **Presenter page dead:** attendees are unaffected (their flow still works and still saves). Run reveals verbally, export tables afterwards.
