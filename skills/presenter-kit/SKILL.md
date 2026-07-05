---
name: presenter-kit
description: Scaffold a NEW interactive presenter talk (slide deck + phone companion + live presenter room-map) from the Presenter Kit template. Use when the user wants to build another talk/deck like the one they already made — "make me a new deck", "new talk", "spin up another presenter kit", "build a talk for <topic>", or when they type /presenter-kit.
---

# Presenter Kit — build another talk

The person already built one of these once, so the machinery is on this machine:
`frontend-slides` is installed and the `deck-template` repo is cloned. Your job is to
spin up a NEW talk fast, reusing all of that. They're likely **non-technical** — do the
technical parts *for* them, explain in plain language one step at a time, and only ask for
the handful of things that are genuinely theirs (topic, brand, Supabase, GitHub account).

## What you're producing
A new self-contained folder with three pieces, all copied from the template's `app/`:
- **`deck.html`** — their slides (you build these with `frontend-slides`).
- **`index.html`** — the phone companion: register → checkpoint questions → summary card →
  live Q&A, with a guided first-run tour built in.
- **`presenter.html`** — their live room-map + Q&A + a gate to pace the room.

All three are driven by one **`config.js`** (brand, `event` slug, `flow`) on a Supabase
backend. Nobody edits HTML to change a question — it all comes from that file.

## Steps

1. **Find the template.** Locate the local `deck-template` cloned during first setup. If you
   can't find it, clone it fresh: `git clone https://github.com/ncih/deck-template <path>`.

2. **Copy it to a new folder** for this talk — never edit the template in place:
   `cp -R deck-template/app <new-talk>/app` and `cp deck-template/schema.sql <new-talk>/`.

3. **Backend (reuse by default).** Ask whether this reuses their existing Supabase project
   (most common — the shared `pres_*` tables already exist from last time) or a new one.
   - *Reusing:* keep the same `url` + `publishableKey` in `config.js`. Nothing else to do.
   - *New project:* run `schema.sql` once in its SQL editor.
   - **Either way, set a FRESH unique `event` slug** (e.g. `their-topic-2026`). This is what
     keeps the new talk's leads/answers separate from every other talk in the same database.
     Never leave the placeholder.

4. **Interview + write `config.js`.** A few quick questions, not a form: their topic, brand
   (name/tagline/presenter), and what they want to learn from the room → the `flow` array
   (checkpoint types: `single` / `multi` / `quiz` / `text`). Then `finale.stops` (which
   answers print on the take-away card) and the two end links — keep `Get the slides →`
   (`deck.html`) and set `Connect with the speaker →` to their real link. Copy existing
   entries as templates; don't reinvent the structure.

5. **Build the deck** with the `frontend-slides` skill on their topic — this is the creative
   part, spend real effort. Put a **QR code linking to `index.html`** on one slide so the
   room can join the companion.

6. **Deploy** to *their* GitHub Pages: new repo, push the `app/` contents, add an empty
   **`.nojekyll`** at the served root, enable Settings → Pages. Hand them the three live URLs.
   Custom domain is optional.

## Reuse, don't reinvent
- `frontend-slides` is already installed — **don't reinstall it**, just use it.
- The companion (`index.html`) and presenter (`presenter.html`) are shared engine files —
  copy them verbatim; only `config.js` (and optionally `theme.css`) change per talk.
- **Only ever ship the *publishable* Supabase key** — never the service-role key.
- **Every talk gets its own `event` slug** — reusing one mixes data together.

The template's `CLAUDE.md` and `SETUP.md` hold the full first-run detail — read them if unsure.
