/* =============================================================================
   DECK CONFIG — the ONE file you edit to make a new deck.
   Loaded by deck.html, index.html and presenter.html.

   1. Paste your Supabase URL + publishable key below.
   2. Set your brand + copy.
   3. Define the `flow` — each entry is one attendee checkpoint.
   4. Replace the slides in deck.html (content only; the engine stays).

   Interaction types supported per flow entry:
     - "single" : pick exactly one chip
     - "multi"  : pick many chips (optional max + exclusive keys)
     - "quiz"   : a run of Yes/No questions -> a verdict picked by #yes
   Copy an existing entry to add a checkpoint. Everything downstream
   (attendee flow, presenter panels, room map) is derived from this array.
   ============================================================================= */
window.DECK_CONFIG = {

  /* ---- Supabase — ONE shared "presentation platform" DB for all decks -------
     Every deck points at the same project + shared pres_* tables (schema.sql).
     Publishable key is safe to ship in client HTML: RLS locks writes to the
     anon role and never exposes the leads table for reading. ------------------*/
  supabase: {
    url: "https://YOUR-PROJECT-REF.supabase.co",
    publishableKey: "sb_publishable_XXXXXXXXXXXXXXXXXXXX"
  },

  /* WHICH presentation/event this is. Stamped on every lead, answer and question
     so exported leads always carry their source. Give each deck/session a unique
     slug — that is how the shared DB keeps events apart. */
  event: "your-event-slug-2026",

  /* Advanced: override the shared table names (defaults to pres_leads / pres_answers
     / pres_questions / pres_state). Rarely needed. */
  // tables: { leads:"pres_leads", answers:"pres_answers", questions:"pres_questions", state:"pres_state" },

  /* localStorage namespace — bump the suffix to reset returning devices. */
  storagePrefix: "deck_v1",

  /* ---- Brand + links -------------------------------------------------------*/
  brand: {
    name:       "Your Brand",
    tagline:    "Session tagline goes here",
    presenter:  "Presenter",                 // used in gate/waiting copy
    logo:       "brand-logo.svg",            // dark logo (attendee, light bg)
    logoWhite:  "brand-logo.svg",            // light logo (dark bg: card head, presenter)
    // shown on the finale card end-screen:
    links: [
      { label: "View today's slides →", href: "deck.html", primary: true },
      { label: "Get in touch →",         href: "https://example.com", primary: false }
    ]
  },

  /* ---- Registration screen -------------------------------------------------*/
  register: {
    kicker: "Welcome",
    title:  "Build your <em>session profile</em>",
    lede:   "A few quick checkpoints through the session — your personalised summary at the end.",
    cta:    "Start",
    fields: [
      { id:"name",    label:"Name",    type:"text",  required:true,  err:"Your name, so the summary is yours." },
      { id:"company", label:"Company", type:"text",  required:true,  err:"Company or project name." },
      { id:"email",   label:"Email",   type:"email", required:true,  err:"A valid email — that’s where the follow-up goes." },
      { id:"role",    label:"Role",    type:"text",  required:false, optional:true }
    ]
  },

  /* ---- The flow: one entry per checkpoint ----------------------------------*/
  flow: [
    {
      id:"cp0", type:"single", gate:0,
      kicker:"Warm-up", cp:"CP0 · About you",
      title:"Which best <em>describes</em> where you are?",
      cta:"That’s me",
      options:[
        { k:"idea",    n:"Just an idea",        sub:"Exploring — nothing built yet." },
        { k:"building",n:"Building it now",      sub:"Heads-down, pre-launch." },
        { k:"live",    n:"Already live",         sub:"Shipped, with real users." },
        { k:"scaling", n:"Scaling",              sub:"Growth is the job now." }
      ]
    },
    {
      id:"cp1", type:"multi", gate:1, max:2, exclusive:["none"],
      kicker:"Checkpoint 1", cp:"Priorities · pick up to 2",
      title:"Where do you most <em>need help?</em>",
      lede:"Pick all that apply — this is a landscape question, not a commitment.",
      pickhint:"Multi-select — up to 2.",
      options:[
        { k:"product",  n:"Product & design",    sub:"What to build, and how it should feel." },
        { k:"growth",   n:"Growth & marketing",  sub:"Getting the right people in the door." },
        { k:"fundraise",n:"Fundraising",         sub:"Runway, rounds, the right investors." },
        { k:"ops",      n:"Ops & hiring",        sub:"The machine behind the product." },
        { k:"none",     n:"Nothing right now",   sub:"Just here to learn." }
      ]
    },
    {
      id:"cp2", type:"quiz", gate:2,
      kicker:"Checkpoint 2", cp:"Quick readiness self-test",
      questions:[
        "Can you state the problem you solve in one sentence?",
        "Do you have users who’d be upset if you disappeared?",
        "Is your runway longer than your next big milestone?"
      ],
      /* verdict = first entry whose `min` <= number of Yes answers.
         Order these from highest `min` to lowest. */
      verdicts:[
        { min:3, good:true,  word:"Ready",        title:"You’re <span class='vaccent'>ready to push.</span>",
          body:"Clear problem, real users, room to run. Pick the one lever that moves the needle and go." },
        { min:2, good:false, word:"Almost",       title:"Almost — <span class='vaccent'>close one gap.</span>",
          body:"You’re nearly there. Name the single weakest answer above and make it a Yes this quarter." },
        { min:0, good:false, word:"Early",         title:"Still <span class='vaccent'>early days.</span>",
          body:"That’s fine — most start here. Nail the problem and the first users before anything else." }
      ]
    }
  ],

  /* ---- Finale card ---------------------------------------------------------*/
  finale: {
    kicker:"Your profile", cp:"Complete",
    title:"Profile <em>confirmed.</em>",
    cardLabel:"Session summary card",
    passLabel:"Your Brand · Session",
    /* which flow answers to print on the card, top to bottom: */
    stops:[
      { cp:"cp0", label:"Stage" },
      { cp:"cp1", label:"Needs" },
      { cp:"cp2", label:"Readiness" }
    ],
    note:"All set — <b>we’ll be in touch.</b><br>Enjoy the rest of the session.",
    footer:"Your Brand — tagline"
  },

  /* ---- Presenter live view -------------------------------------------------*/
  presenter: {
    title:"Live Room Map",
    footer:"Your session · live audience view"
  }
};
