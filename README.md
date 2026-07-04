# Interactive deck template

🤖 Non-technical? See CLAUDE.md — paste the prompt from the demo and your Claude Code will set this up for you.

A reusable kit for **live, interactive presentations**: a slide deck + a phone companion
(checkpoints + live Q&A) + a presenter room-map view, backed by Supabase and hostable on
GitHub Pages. Copy the folder, edit one config file, run one SQL script, deploy.

- **New to this? → read [`SETUP.md`](SETUP.md).** 6 steps, ~15 minutes.
- **Running a session? → read [`app/README.md`](app/README.md).** The presenter ops guide.
- **Want to see it real? →** the sibling `../workshop-sto-readiness/` deck is a run example.

## How it fits together

```
config.js ──────────┬──────────────┬──────────────────┐
 (the one file       │              │                  │
  you edit)     deck.html       index.html        presenter.html
                 slides        phone companion     live room map
                                     │                  │
                                     └──── Supabase ─────┘
                                 ONE shared DB, event-tagged:
                              pres_leads · pres_answers ·
                              pres_questions · pres_state
```

`config.js` is the single source of truth — brand, Supabase creds, the `event` slug, and the
`flow` (each checkpoint). The attendee screens, the presenter panels, the room-map stats and the
pacing gate are all **derived from `flow`**; you never edit the HTML to change the questions.

## Design guarantees
- **One shared DB, many events.** Every deck points at the same Supabase project + `pres_*`
  tables; each row is stamped with the deck's `event` slug, so the presenter is scoped to its
  event and exported leads always know which presentation they came from.
- **Fails open.** No Supabase, or a dead network mid-session? The deck is static and the
  companion queues answers locally and unlocks the gate — the room is never stuck.
- **Publishable-key safe.** RLS locks writes to the `anon` role and never exposes `pres_leads`
  for client reads, so the key is safe to ship in the HTML.
- **Static + portable.** Three HTML files + one JS config. GitHub Pages, Netlify, or a plain
  `python3 -m http.server`.

## Files
| Path | Role |
|---|---|
| `config.js` | **Edit this.** Creds, `event` slug, brand, flow, finale. |
| `theme.css` | **Re-skin here.** Accent + fonts for the companion + presenter. |
| `deck.html` | **Replaceable** starter deck — bring your own (e.g. via `frontend-slides`). |
| `index.html` | Attendee companion. |
| `presenter.html` | Presenter live view. |
| `brand-logo.svg` | Placeholder logo asset. |
| `schema.sql` | Shared `pres_*` tables + RLS. Run once per project. |

## Theming
The **deck** and the **audience layer** are independent. Build the deck in any theme (its look
is entirely its own). The companion + presenter share `theme.css` — change `--accent` and the
fonts there to re-skin both at once. Neutral by default.
