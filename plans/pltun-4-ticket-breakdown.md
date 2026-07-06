# pltun-4 Ticket Breakdown
This plan is not up to date. Read the pltun-4 ticket from vikunja instead.

## Status (2026-07-01)

- **Created:** T1 = pltun-6 (foundation, label Maintenance, subtask of epic). Schema-design
  hub = pltun-7 (research). Research tickets R1–R6 = pltun-8…pltun-13 (research, related to
  pltun-7). Epic comments 14 (breakdown) + 15 (locked schema decisions) posted.
- **Locked schema decisions:** UUIDv7 surrogate PKs (queue arrays → `uuid[]`); `album` unique
  `(name, artistId)` + add `year`; keep `artist.biography`; `widget` as-is + `userId`; drop
  `config` (→ `user_preferences` table).
- **Blocked on research:** T2 (schema) waits on R1–R6 resolving. T1 has no schema dep and can
  start now / in parallel.
- **Not yet created:** T2–T13 (created once schema settles). T10 will be created but flagged
  deferred (post initial-conversion).

## Context

The PlooTunes migration epic (**pltun-4**) is specced enough to decompose into implementation
tickets. This plan is the working draft of that decomposition — we iterate here freely
**without touching the existing epic ticket**, and once it's good, create all tickets in
Vikunja (project 6) as subtasks of pltun-4 with a precedes/follows ordering chain.

Two agreed deviations from the epic's own phase list:

1. **Foundation-first, framework-skeleton ticket leads.** Ticket 1 stands up the *shape* of
   everything (package structure, conventions, docs, museum, e2e skeleton) but ports no
   source and is not yet bootable — "shape A" from our discussion. The scenario harness
   becomes *live* only once the server + schema + Docker exist, so its activation lands as
   the final ticket.
2. **Museum exhibits are COPIED, not moved.** Ticket 1 copies the exhibit files into
   `museum/`; the originals are deleted later by whichever ticket ports/retires the
   directory they live in (mainly the catalog/per-user/client tickets that gut `electron/`).

Restructure moves are **deferred and coupled to their port ticket**: each package's
`git mv` happens as the first commit of the ticket that ports that slice (move commit, then
edit commits) so `git log --follow` stays clean and the repo builds at every step. Ticket 1
only creates empty package skeletons alongside the still-working `src/` tree.

**Mobile (`src/mobile`) is out of scope for this breakdown** — deferred to a dedicated
architecture session per the epic's OPEN section; it does not gate any ticket below. No
ticket created for it now.

---

## Proposed tickets (13)

Each ticket below → will become one Vikunja task under pltun-4. "Phase" notes the epic phase
it derives from.

### T1 — Foundation & framework skeleton  *(new lead ticket; absorbs slices of phases 1, 9-doc, 10-skeleton)*
Stand up the structure/conventions with no ported source; repo stays green and the old
Electron app keeps working.
- Create `packages/{shared,server,client}` skeletons: each with `package.json`
  (`type: module`, `@ploot/plootunes-*`), `tsconfig` extending a new root
  `tsconfig.base.json`, tsx + vitest dev deps, wired into `pnpm-workspace.yaml`. Bare
  `index.ts` / `src/index.ts` stubs only.
- Root conventions: `tsconfig.base.json`, `--frozen-lockfile`, lint/format config.
- **CLAUDE.md rewrite**: new `packages/` architecture, DAO/service/route + Drizzle + auth
  conventions, updated commands, and the **interactive Playwright-MCP verification workflow**
  as a first-class finishing step.
- `museum/` dir + **copy** Exhibits A/B/C (see file list above); build-excluded. Plaques
  (README per exhibit).
- `e2e/` skeleton: `baseline/` (placeholder `seed.sql` + README on the scrape-to-seed
  approach), `scenarios/` with one example dir, `docker-compose.e2e.yml` skeleton,
  `app:up`/`app:down` script stubs, prod-guarded auth-bypass convention **documented** (not
  bootable yet).
- Leaves `src/{core,electron,react,mobile}` in place.
- **Depends on:** none (first ticket).

### T2 — Server skeleton: Postgres + Drizzle + schema + migrations + DI + health  *(phase 2)*
- `packages/server`: postgres.js + Drizzle, `db/{index,schema,migrate}.ts`,
  `dbUpdates/` drizzle-kit migrations (timestamp prefix).
- `schema.ts`: `users`; shared canonical catalog (`genre`/`artist`/`album`/`song`) with
  **surrogate PK + content-hash column**, no userId; per-user overlays
  (`user_library_source`, `songStat`, array-model `queue`, `playback_state`, `widget`);
  retained `config`/`job`/`jobData`. Apply SQLite→PG dialect fixes.
- `factory.ts` / `serviceFactory.ts` DI (primal-style, explicit — no decorators).
- `GET /api/health`.
- **Depends on:** T1.

### T3 — Auth: OIDC/session/middleware + usersDao + isAdmin stub  *(phase 3)*
- Port primal OIDC discovery + `express-session` + auth-gate middleware setting
  `req.userId`; `app.set('trust proxy', true)`.
- `routes/auth.ts` (`/login`, `/exchange`, `/logout`); `usersDao.upsert` (copy primal).
- `types/express.d.ts` for `req.userId` + session typing.
- `isAdmin` stub surfaced onto session (default: the Emperor); real Authentik claim wired
  later.
- Env: `OIDC_*`, `SESSION_SECRET`.
- **Depends on:** T2.

### T4 — Catalog DAOs/services → routes (shared storage, **user-scoped reads**)  *(phase 4)*
- `git mv` `core/db/dbEntities/{album,artist,song}` + shared types → `packages/shared`;
  port `dto/{albumDto,artistDto,songDto}.ts` → server DAOs; catalog services → routes.
- **Catalog storage stays shared** (no `userId` column). **Browse endpoints are
  user-scoped** — they return only catalog rows in the requesting user's library, derived
  from `req.userId`, NOT the whole global catalog:
  - `GET /api/songs` → songs whose `path` falls under one of the user's subscribed folders
    (+ optional `?albumId=`/`?artistId=` narrowing, still within scope).
  - `GET /api/albums` → albums with ≥1 in-library song for the user (+ `?artistId=`).
  - `GET /api/artists` → artists with ≥1 in-library song for the user.
- **Library-membership helper** — introduce one reusable query fragment/DAO helper:
  "canonical songs for userId" = `song` rows whose `path` has a prefix matching any
  `user_library_source.folderPath` for that user (path-prefix must be separator-aware so
  `/library/A` matches `/library/A/…` but not `/library/AB`). All three list queries build on
  it; reused by later per-user features.
- Excludes `missing` rows from browse by default (admin management surfaces in T8 query the
  full catalog directly, unscoped).
- Delete the now-ported `electron/` catalog services + their `handlerServices/{album,
  artist,song}` originals (museum copies already exist).
- **Depends on:** T2 (schema — incl. the `user_library_source` table this joins against),
  T3 (`req.userId`). Subscription *management* endpoints live in T5 and full end-to-end
  browse also needs scan (T7) to populate the catalog; T4's own tests seed `song` +
  `user_library_source` rows directly. *(See open question re: pulling subscriptions
  forward.)*

### T5 — Per-user DAOs/services → routes  *(phase 5)*
- Port scoped by `userId`: `queueDto` → **redesigned array-model** `queue` DAO
  (`songIds[]` + nullable `playOrder[]`, shuffle behind the DAO API); `statDto` → stats;
  `systemDto` → **replaced by** `playback_state` (cursor/positionMs/shuffled/repeat);
  `widgetDto` → widgets; new `user_library_source` subscriptions DAO.
- Routes: `/api/queue/*` (full verb list from epic), `GET/PUT /api/playback`,
  `GET/POST/DELETE /api/widgets`, `POST /api/stats/play`,
  `GET/POST/DELETE /api/library/subscriptions`.
- Delete the ported `electron/` per-user services + `handlerServices/{queue,stat,system,
  widget}` originals.
- **Depends on:** T2, T3.

### T6 — Audio range-streaming + cover serving  *(phase 6a)*
- `GET /api/audio/:songId/stream` with HTTP Range (206 partial content); replaces
  `audioService.getSongBuffer()` buffer-over-IPC.
- Static `/covers/*` (primal `coverStorageService` as template).
- **Depends on:** T4 (song lookup).

### T7 — Library scan/reconcile engine + hash-relink  *(phase 6b)*
- `POST /api/library/scan` (admin): walk `MEDIA_ROOT`, SHA-256 each file, match catalog →
  unknown = new row, moved (same hash) = auto-relink, no-file = mark `missing`.
  **Non-destructive** (never hard-deletes a canonical row). Shared per-file ingest core.
- Port logic from `services/system/librarySetupService.ts` + `utilityRunners/
  scanFilesRunner.ts`; `config`/`job`/`jobData` bookkeeping.
- **Depends on:** T4.

### T8 — Upload ingest (stream to disk) + admin relink/hard-remove endpoints  *(phase 6c/6d, server)*
- `POST /api/library/upload` (admin): **stream to disk** (no whole-file buffering), then run
  the same per-file ingest core as the scanner.
- Admin relink + hard-remove endpoints for `missing` rows (hard-remove is the only path that
  deletes a canonical row).
- Upload destination = sensible tag-derived default; at-add override UI deferred to T10.
- **Depends on:** T7 (shared ingest core).

### T9 — Rewire client → apiFetch; audio → stream URL; covers; auth callback  *(phase 7, core)*
- `git mv` `src/react` → `packages/client`; rewire the 8
  `view/**/electronServices/*.ts` from `ElectronUtil.invoke` → `apiFetch`.
- `audioService` → set `<audio src>` to stream URL + seek to `positionMs`; covers → base
  path; `AuthCallback` page + `apiFetch` 401 → `/api/auth/login` redirect.
- Delete `src/electron` preload bridge + remaining Electron shell (museum copies retained).
- **Depends on:** T4–T8 (routes exist), T3 (auth callback).

### T10 — Client library UIs: subscriptions, upload/ingest, relink  *(phase 7, feature UIs)*  — **DEFERRED (post initial-conversion)**
- **Not part of the initial conversion phase.** Ticket gets written and created so the work
  is captured, but it is explicitly out of scope for this migration pass — the actual UI
  designs need more thought first. Mark accordingly (label/description note; likely no
  precedes/follows slot in the initial chain).
- Folder-subscription UI (whitelist, reject parent/child overlap); bare upload UI (at-add
  override layered after); admin missing/relink + hard-remove UI. Uses `@ploot/pds`.
- **Depends on:** T9 (client on HTTP), T5 + T8 (endpoints) — plus a dedicated design pass.

### T11 — Dockerize + plootServer wiring  *(phase 8)*
- `docker/`: `Dockerfile.server` (node:22, pnpm `--frozen-lockfile`, drizzle migrate on
  entrypoint, **fixed non-root UID**), `Dockerfile.client` (nginx SPA + proxy
  `/api`,`/covers`,audio), `docker-compose.yml`, `nginx.conf`; Postgres 16-alpine +
  healthcheck + volume.
- Covers named volume; music bind-mount(s) as siblings under `MEDIA_ROOT`, **RW, owned by
  the container UID** (OS-ownership guard: chown at setup, group/other read-only).
- Wire service into **plootServer** (prod source of truth).
- **Depends on:** T2 (migrate), and enough of the app to build both images (T9).

### T12 — Testing: jest → vitest + testcontainers  *(phase 9)*
- Migrate jest → vitest; add primal's testcontainers integration harness. Port
  `queueServiceTest` + `librarySetupServiceIntegrationTest`. Cover scan/reconcile
  (new/moved/missing via hash), non-destructive rescan, and queue/playback model (shuffle
  on/off keeps spot, add-while-shuffled moves nothing, cursor next/prev, resume).
- **Depends on:** feature tickets (T4–T8) landed.

### T13 — Activate E2E / LLM scenarios harness  *(phase 10 — makes T1's skeleton live)*
- Fill `e2e/baseline/seed.sql` (canonical catalog + real covers/audio staged under
  `MEDIA_ROOT`) via documented scrape queries; make `docker-compose.e2e.yml` bootable;
  `app:up`/`app:down` live; auth-bypass wired (prod-guarded, injects fixed E2E user).
- Playwright spec suite (`pnpm test:e2e`).
- Seed scenarios: **big-library**, **multi-user**, **missing-and-moved**, **shuffled-queue**.
- **Depends on:** T11 (Docker) + the feature tickets whose data the scenarios exercise.

---

## Creation strategy (once this draft is approved)

- Create T1…T13 in Vikunja **project 6** via `vikunja_create_task`, descriptions in HTML
  (matching the epic's style), each linking back to pltun-4.
- Relate each as a **subtask of pltun-4** and chain **precedes/follows** in the T1→T13 order
  (with the cross-dependencies noted per ticket).
- Apply labels: `feature` for feature tickets; `Maintenance`/`Tech Debt` where it fits
  (e.g. T12 testing migration, T1 conventions). Confirm label choice per ticket at creation.
- Leave the epic ticket unchanged.

## Verification

Not code — verification is: after creation, `vikunja_list_tasks` (project 6) shows T1–T13,
each related to pltun-4, ordering chain intact, labels applied. Re-read one or two created
tickets to confirm HTML rendered correctly.
