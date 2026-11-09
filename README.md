# Allez ! — a gamified French course

A mobile-first French learning platform: a structured CEFR course (A1 → C2), interactive lessons, spaced-repetition revision, quests and rewards, a French Mastery Library, a study planner and an optional Queensland QCE school mode.

It deploys as a **single Railway service with Postgres**. The Node server serves the app, handles accounts and progress sync, and hosts the optional AI tutor. Learning itself is local-first: lessons, checking, revision and rewards all run on the device, so it keeps working offline and isn't slowed by the server.

## Quick start

```bash
npm install
npm run dev            # app on http://localhost:5173 (works without the server)
npm run dev:server     # API on :3000 — needs DATABASE_URL in .env (see .env.example)
npm test               # logic + content validation
npm run build          # builds the app (dist/) and the server (server-dist/)
npm start              # production server: app + API on $PORT
```

## What works now

| Area | Status |
|---|---|
| Onboarding with an adaptive placement check (A1–B2), letting learners skip units they already know | ✅ |
| Course map for A1–C2. **A1 is fully authored: 8 units, 24 lessons, 8 checkpoints, ~230 words.** A2–C2 show planned units | ✅ |
| Lesson engine with 14 exercise types (see below) | ✅ |
| Answer checking: deterministic and accent-aware, with typo tolerance only on long words | ✅ |
| Spaced repetition (SM-2 variant) for words, grammar concepts and custom flashcards | ✅ |
| Revision dashboard: due cards, strong and weak areas, revise by unit or deck | ✅ |
| Practice: listening sprint, mixed quiz, verb drills in 6 tenses, reading, conversation scenarios | ✅ |
| Gamification: XP and player levels, coins, daily and weekly quests, 22 achievements, forgiving streaks with protectors, boutique (5 themes, avatars, frames) | ✅ |
| Proficiency tracked separately from XP: CEFR level and per-skill levels come only from checkpoint and placement evidence | ✅ |
| Notebook: vocabulary bank, custom flashcards, lesson-to-deck generation on request, searchable Library (58 articles), verb tables (42 verbs × 7 tenses) | ✅ |
| Study hub: daily goal, planner and calendar, assessments, reminders (in-app notification + .ics calendar event) | ✅ |
| School mode: QCE French 2025 syllabus, Units 1–4, 11 topics, exam-style tasks, IA1/IA2/IA3/EA guide | ✅ |
| Audio: free on-device text-to-speech (Web Speech API); speech recognition where the browser supports it | ✅ |
| Data export/import (JSON backup) | ✅ |
| Accounts (email + password) and cross-device progress sync in Postgres | ✅ |
| AI tutor: explain, hint, correct my writing, free conversation. Signed-in learners only, with a daily cap per learner | ⚙️ set `ANTHROPIC_API_KEY` |
| Password reset / magic-link email | 🔜 needs an email provider (e.g. Postmark) |
| Background push notifications when the app is closed | 🔜 future (needs a push server) |
| A2–C2 lesson content | 🔜 add unit files |

The 14 exercise types are: intro/discovery cards, vocab cards, multiple choice, matching, fill-in-the-gap, word order, translation, listening, dictation, conjugation tables, reading comprehension, scripted dialogues, writing and speaking.

## Architecture

```
src/
  content/          ← ALL learning content, as typed data (no UI code)
    types.ts          schema for units, lessons, exercises, library, verbs, school
    units/a1-u*.ts    one file per unit — auto-discovered
    levels.ts         CEFR level metadata + planned units for the map
    library/          Mastery Library articles and verb tables
    placement.ts      placement questions
    school.ts         QCE topics, tasks, assessments
    content.test.ts   validator: references, answer indices, ids
  lib/              ← deterministic rules
    answer.ts         answer checking
    srs.ts            spaced repetition
    game.ts           XP, levels, quests, achievements, shop
    proficiency.ts    evidence-based CEFR/skill levels
    sessions.ts       builds revision/practice sessions from content
  state/store.ts    ← learner state (zustand, persisted locally)
  sync/cloud.ts     ← account + progress sync with the server
  ai/tutor.ts       ← optional AI client (isolated)
  exercises/, components/, pages/
server/             ← Express server for Railway
  index.ts            static app, auth, /api/state, /api/tutor
  db.ts               Postgres pool + idempotent migrations (run on boot)
  auth.ts             scrypt password hashing, httpOnly session cookies
  tutor.ts            optional Claude proxy with a per-learner daily cap
```

**XP ≠ coins ≠ proficiency.** XP measures activity, coins buy cosmetics, and CEFR levels only come from passing assessments (80% on unit checkpoints). Nothing in the game layer can raise a learner's proficiency.

## Adding content

1. Copy an existing unit file, e.g. `src/content/units/a1-u1.ts` → `a2-u1.ts`, and set `level: 'A2'`.
2. Remove the matching entry from `planned` in `levels.ts`.
3. Run `npm run validate:content`. It catches broken vocab or library references, out-of-range answers and duplicate ids.

No UI changes are needed.

## Deploying to Railway

1. **Create a project** in Railway and add a **PostgreSQL** database.
2. **Add a service from this GitHub repo.** `railway.json` sets the build (`npm run build`), the start command (`npm start`) and a health check on `/api/health`.
3. **Set the service variables:**
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (a reference to the database; uses Railway's private network)
   - Optional: `ANTHROPIC_API_KEY` to switch on the AI tutor
   - Optional: `AI_MODEL` — the default is `claude-opus-5-5`; `claude-haiku-5-5` is far cheaper
   - Optional: `AI_DAILY_LIMIT` — requests per learner per day, default 40
   - Optional: `ALLOWED_EMAIL_DOMAINS` (or `ALLOWED_DOMAINS`), e.g. `emason.com.au` — only these email domains can create accounts or log in (comma-separate several)
4. **Generate a domain** under the service's Settings → Networking.

Tables are created automatically on first boot. Railway supplies `PORT` itself. Don't set `NODE_ENV=production` as a build-time variable, because the build needs the dev dependencies (TypeScript, Vite).

On iPhone, open the site in Safari and use **Share → Add to Home Screen** to install it like an app.

### How sync works

Progress is stored on the device first. When a learner is signed in:

- Changes upload a few seconds after they happen.
- The newest copy is pulled when the app opens.
- Signing in on a device that already has *different* progress asks which copy to keep.
- Each learner's progress is one JSON document in `learner_state`. Writes are last-write-wins, and the server rejects a stale write in favour of the newer copy.

## Content notes

- The French content was written and proof-read for this project, and an automated validator checks it structurally. A native-speaker or teacher review before wide release is still recommended.
- The school material is original practice aligned to the QCAA French 2025 General syllabus. It is not official QCAA content.
