# Setting up this deck — instructions to Claude Code

## Read this first (to Claude Code)

The person you're working with is likely **non-technical**. They cloned this repo because
someone showed them a working example and said "your Claude Code can build you one of these."
That's the whole pitch — so make it true.

- **Do the technical parts *for* them.** Don't hand them a terminal command and wait; run it
  yourself. Don't explain what SQL is; just run the script. Ask for the handful of things only
  they can provide (their topic, their Supabase project, their GitHub account) and carry
  everything else.
- **Explain in plain language, one step at a time.** No jargon dumps. If you must use a term
  (RLS, publishable key, repo), say what it does in the same breath, once, and move on.
- **Best run on Opus.** If you're not currently on Opus, tell the person: "This will go better
  on Claude Opus — if you can switch models before we start, do; otherwise I'll carry on here."
  Then continue regardless of their answer.
- **Required skill: `frontend-slides`.** You'll use it in step 3 to build their actual slide
  deck. Check it's available before you get there. If it isn't installed, **install it for
  them** — it's open-source: run
  `git clone https://github.com/zarazhangrui/frontend-slides ~/.claude/skills/frontend-slides`
  yourself, then tell them in one line to reload or restart Claude Code so it's picked up.
  They don't need to do anything technical here beyond that restart — continue with setup
  once it's installed.
- **Nice to have: `frontend-design`.** Not required, but if it's available, use it alongside
  `frontend-slides` for extra visual polish on the deck.

## What this is

Two decoupled layers, one config file:

- **The deck** — `app/deck.html`. Their slides. Fully theirs; you'll build this from scratch
  on their topic in step 3.
- **The audience layer** — `app/index.html` (the phone companion the room opens: register →
  checkpoint questions → live Q&A) and `app/presenter.html` (their live view: a room-map of
  answers, a gate to pace the room, Q&A moderation). This machinery is reusable and doesn't
  care what the deck looks like.

They're connected by exactly one thing: `app/config.js`. It holds the Supabase credentials,
the brand (name, tagline, links), and the `flow` — the array of checkpoint questions that
drives the phone companion, the presenter panels, and the room-map stats. Nobody edits HTML
to change a question; it all comes from this one file.

`schema.sql` is the database script behind it — three tables plus row-level security. It runs
once, ever, in their Supabase project.

## Setup steps (do these WITH them, in order)

### 1. Supabase (free backend)
Walk them through supabase.com:
1. Have them create a free project (or tell them you'll need the org/project name to guide
   them through the dashboard — you cannot click buttons in their browser for them, so narrate
   each click).
2. Once it's live, have them open **SQL Editor → New query**, paste in the full contents of
   `schema.sql`, and hit **Run**. Confirm it succeeded (it creates `pres_leads`, `pres_answers`,
   `pres_questions`, `pres_state`).
3. Have them go to **Project Settings → API** and copy two values back to you: the **Project
   URL** and the **publishable** key (starts `sb_publishable_…`). Paste both into
   `app/config.js` under `supabase: { url, publishableKey }`.

Explain it as: "This is the free database that catches every answer your audience gives you,
live, while you're talking."

### 2. Their content (`config.js`)
Interview them briefly — a few quick questions, not a form:
- What's the talk about, and what's their brand/name/tagline?
- What's a **unique event slug** for this session (e.g. `their-name-2026` or
  `company-launch-q1`)? Explain: this tag keeps their data separate from every other deck
  that might ever share the same Supabase project — never leave it as the placeholder.
- What do they want to learn about their audience? This becomes the **checkpoint questions**
  (the `flow` array). Explain the four types plainly as you go:
  - **single** — pick one option (e.g. "which best describes you?").
  - **multi** — pick a few (e.g. "which of these do you care about?").
  - **quiz** — a run of yes/no questions that adds up to a verdict (e.g. a readiness score).
  - **text** — one open-ended question, free typing (good for a closing "what would you want?").

Write `config.js` yourself once you have their answers: `brand`, `event`, `flow`, and
`finale.stops` (which answers print on the summary card attendees see at the end). Copy the
existing entries as templates — don't reinvent the structure.

### 3. Their deck (`app/deck.html`)
Use the **`frontend-slides`** skill to build their actual slides, on their topic, from scratch.
This is the creative part — spend real effort here, it's most of what the audience sees.
- Match a clean, coherent look — ask about their aesthetic preferences if unclear, the skill
  is built for exactly this kind of discovery.
- Put a **QR code linking to `index.html`** on one slide so the room can join the companion.
- Set `config.js → brand.links` to point at their deck (this is the "view slides" link shown
  on the attendee summary card).

The deck is independent of the audience layer — any look works, as long as those two things
are true.

### 4. Deploy to their own GitHub Pages
1. Help them create a new GitHub repo (their account, not yours).
2. Push the `app/` folder's contents to it.
3. **Add a `.nojekyll` file at the served root** — GitHub Pages runs Jekyll by default, which
   chokes on the `{{ }}`-style JS braces in these HTML files and can 404 them. An empty file
   named `.nojekyll` turns Jekyll off.
4. Enable **Settings → Pages → Deploy from branch** on their repo.
5. Custom domain is optional — skip unless they ask.
6. Hand them their three live URLs when Pages finishes building:
   - Deck: `https://<user>.github.io/<repo>/deck.html`
   - Companion: `.../index.html`
   - Presenter: `.../presenter.html`

### 5. How to run it live
Point them at `app/README.md` for the full presenter ops guide, and summarize the essentials:
- Open `presenter.html` yourself in a second tab, full-screen it. It starts gated at
  checkpoint 0 — you advance the room with "Open next →" as you talk, so nobody races ahead.
- The companion QR (on their deck slide) is what the room scans to join.
- After the session, export their leads straight from Supabase: **SQL Editor** →
  `select * from public.pres_leads where event = 'their-event-slug';` → export as CSV.

## Guardrails

- **Only ever ship the *publishable* key** in `config.js` — never the service-role key. The
  publishable key is safe in client-side HTML because row-level security locks writes to the
  `anon` role and never exposes `pres_leads` for reading. If you ever see a service-role key
  (long, usually starts differently, described as "secret" in the Supabase dashboard), stop
  and do not put it in this file.
- **Every deck needs its own unique `event` slug.** If they reuse a slug from another deck
  (including the demo's own), their leads, answers, and room-map tallies will mix together in
  the shared database. Never leave the placeholder value in place.
