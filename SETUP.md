# Deck template — setup & reuse

A reusable **interactive-presentation kit**: a slide deck + a phone companion (checkpoints
+ live Q&A) + a presenter live view, backed by Supabase. Copy this folder, change one config
file, run one SQL script, deploy. ~15 minutes to a new live deck.

> Worked example: the `workshop-sto-readiness/` deck one level up is a real, run deck built on
> this exact structure. Peek there when you want to see the pattern fully fleshed out.

## What you get

| File | Role |
|---|---|
| `app/config.js` | **The only file you must edit.** Supabase creds, brand, and the whole flow. |
| `app/deck.html` | **Replaceable** starter slide deck (1920×1080, keyboard + swipe + progress + `#n` deep-links). Swap for your own — see the two paths below. |
| `app/index.html` | Attendee companion — register → checkpoints → summary card, live Q&A, offline-safe. |
| `app/presenter.html` | Your live view — room-map tallies, the attendee **gate**, Q&A moderation. |
| `app/theme.css` | **Re-skin here** — accent colour + fonts for the companion + presenter (one file, both re-tint). |
| `app/brand-logo.svg` | Placeholder logo asset (the HTML uses a text wordmark by default). |
| `schema.sql` | Shared `pres_*` tables + RLS. Run **once** per Supabase project (all decks reuse it). |

## Two decoupled layers (important)

- **The deck** (`deck.html`) is *just slides* — fully independent and replaceable. Build it
  in any theme you like (including with the **frontend-slides** skill) and drop it in.
- **The audience layer** (`index.html` + `presenter.html`) is the reusable machinery. It has
  its own neutral theme in `theme.css`. It never reads the deck or shares its styling — the
  only link between them is one line in `config.js` (`brand.links`) pointing at your deck.

So "using a different theme for the deck" is fully supported: the deck and the companion are
independent by design. Match them loosely (or not) by setting `--accent` in `theme.css`.

## Steps

### 1. Copy the folder
```bash
cp -R _deck-template my-new-deck
```

### 2. Supabase — ONE shared "presentation platform" DB (set up once, ever)
All decks share a single Supabase project and one set of `pres_*` tables. You only do this **once**:
1. Create a project at [supabase.com](https://supabase.com) (free tier is fine) — this is your
   presentation backend for *every* deck.
2. **SQL Editor → New query →** paste all of `schema.sql` → **Run**.
3. **Project Settings → API →** copy the **Project URL** and the **publishable** key
   (`sb_publishable_…`), safe in client HTML — RLS keeps writes to `anon` and never exposes
   `pres_leads` for reading.

For every future deck you reuse the same URL + key — you do **not** make a new project.

> No Supabase? The whole thing still runs — the deck is static and the companion **fails open**
> (answers queue in localStorage, gate defaults open). You just won't get the live room map.

### 3. Fill in `app/config.js`
- `supabase.url` + `supabase.publishableKey` — from step 2 (same for all decks).
- **`event`** — a unique slug for *this* presentation/session (e.g. `acme-demo-2026`). It's
  stamped on every lead, answer and question, so the shared DB keeps events apart and
  **exported leads always carry their source presentation**. Give each deck its own slug.
- `brand` — name, tagline, presenter, links.
- `flow` — one entry per checkpoint. Copy an existing entry to add one. Types:
  - `single` — pick one chip.
  - `multi` — pick many (`max`, `exclusive` keys supported).
  - `quiz` — a run of Yes/No questions → a verdict chosen by the number of Yes answers.
- `finale.stops` — which answers print on the summary card.
- `exitRamp` — the small always-on badge (all three pages) + the "more from the speaker"
  link on the final card, so no page dead-ends a visitor. Ships pointing at the template
  author's site — repoint both URLs (and the deck's closing slide) at your own.

Everything downstream (attendee screens, presenter panels, room-map stats, the gate) is
**derived from `flow`** — you don't touch the HTML to change the questions.

### 4. Build the deck — two paths
The deck is independent of the interactive layer, so pick whichever suits the deck you want:

- **Path A — keep the starter engine.** Edit the `<section class="slide">…</section>` blocks in
  `app/deck.html`. Add/remove slides freely; the counter + progress bar adjust automatically.
  Brand name / tagline / presenter auto-fill from config via the `data-brand` / `data-tagline`
  / `data-presenter` attributes.
- **Path B — build it with the `frontend-slides` skill (any theme).** Generate the deck however
  you like, then wire it to the interactive layer with this tiny contract:
  1. Save/host the generated deck (as `deck.html`, or anything — just update the link).
  2. Point `config.js → brand.links` at your deck file (that's the "View slides" button on the
     summary card).
  3. Put a **QR code to `index.html`** on one of your slides so the room can join the companion.

  The companion + presenter don't care what the deck looks like — they only share `config.js`.

### 4b. Tint the audience layer (optional)
Open `app/theme.css` and set `--accent` (and the fonts) to loosely echo your deck. Both the
phone companion and the presenter view re-skin from that one file — including the presenter's
dark surface (`--navy-deep` / `--navy-card`, also in `theme.css`).

### 5. Test locally
```bash
cd my-new-deck/app && python3 -m http.server 4599
```
Open `http://localhost:4599/deck.html` (deck), `/index.html` (phone companion),
`/presenter.html` (live view). Full flow works offline; connect Supabase to see tallies.

### 6. Deploy to GitHub Pages
Push `app/` to a repo, enable **Settings → Pages → Deploy from branch**. Then:
- **Attendees** scan a QR pointing at `…/index.html` (make the QR in step 4's slide).
- **You** open `…/presenter.html` in a second tab and full-screen it (see `app/README.md`).
- The deck is `…/deck.html`.

## Running the room
See **`app/README.md`** — the presenter ops guide: the gate (you pace the room), the reveal
keys (`0–N` focus a panel, `Q` for Q&A, `Esc` back to grid), and the fail-open fallbacks.

## Reset between runs (per event — never touches other decks)
```sql
delete from public.pres_leads     where event = 'your-event-slug';
delete from public.pres_answers   where event = 'your-event-slug';
delete from public.pres_questions where event = 'your-event-slug';
update public.pres_state set open_checkpoint = 0 where event = 'your-event-slug';
```
(or bump `storagePrefix` in config.js to reset returning devices).

## Export leads (attributed to the presentation)
```sql
select * from public.pres_leads where event = 'your-event-slug';
```
Every row carries its `event`, so a single export across all decks still tells you which
presentation each lead came from.
