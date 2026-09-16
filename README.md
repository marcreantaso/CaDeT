# CaDeT

## Career Digital Twin

The Career Map turns a user's saved goals, skills, projects, experience, and
ACTOR progress into an explainable **career evidence alignment** model. It does
not predict employment success.

Each supported path is scored with explicit weights:

- skill match: 40%
- completed project evidence: 25%
- relevant experience: 15%
- ACTOR execution progress: 10%
- declared goal intent: 10%

The What-If simulator works on a temporary copy of the user's data. Simulated
scores never change real records. A user can convert selected changes into a
real 14-day ACTOR TEST; CaDeT then atomically creates the experiment, evidence
tasks, ACTOR event, and stage transition in IndexedDB.

A local-first career development tracker built with React, TypeScript, Vite, and Dexie/IndexedDB.

## Run and verify

```sh
npm ci
npm run dev
npm test
npm run build
```

## Career workflow

- Use **Quick add** to save a goal, target, skill, task, project, experiment, achievement, reflection, or work experience.
- Review saved entries in **Records**. Update skill confidence and levels, change task/project/experiment status, record experiment ratings, and select the active career target.
- Completed projects with an evidence description or link contribute evidence to skills with matching names (case insensitive). Project status changes update that relationship without double counting.
- **Next best action** prioritizes overdue unfinished tasks, then task priority and due date. With no pending tasks, it considers goals, an active target, skill gaps, projects, and the ACTOR stage. These are deterministic suggestions, not AI-generated predictions.
- **Readiness** uses the existing documented scoring rubric. Its explanation shows component weights and distinguishes unrecorded evidence from poor performance.
- **Readiness history** records the latest score for each UTC day while the workspace is open. Past days are preserved; missing days are not backfilled. **Career direction history** records actual saved forecasts, with no sample trajectories. Forecast generation is not implemented by this change.

## Backup and restore

Open **Records → Backup and restore**. Export the JSON file and keep it outside the browser.

Restore accepts CaDeT version-1 backups up to 5 MB and 10,000 records per collection. A validated preview appears before import. All writes run in one transaction: failure rolls everything back. Missing records are added; existing records are retained unchanged. Imported records belong to the current workspace. Existing active targets take precedence over imported ones.

Backups include career records, insights, forecasts, and history. Profile settings and ACTOR stage settings are excluded. Browser storage is device-local; clearing site data can erase it. There is no cloud synchronization or real sign-in system in the existing offline auth provider.

## Verification

`npm test` exercises IndexedDB with fake-indexeddb: all nine create flows, validation, persistence after reopening, readiness changes, workspace ownership, target activation, backup round trips, duplicate/invalid backup rejection, transactional rollback, task ranking/completion, project evidence linking, experiment ratings, and daily snapshots.

Browser/device QA is still required before release. The implementation environment blocked the local preview through its browser URL policy. Check 320/390 px phones, 768 px tablets, desktop, landscape, 200% zoom, keyboard-only navigation, and dialog focus restoration. The automated tests do not claim to verify rendered layouts.
