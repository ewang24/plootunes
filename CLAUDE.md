# PlooTunes — Claude Instructions

## Project Management

Project: **PlooTunes** (ID: 6). Use the `plootocol` MCP tools to read and write tickets — `vikunja_list_tasks` with `project_id: 6`, `vikunja_create_task` for new work, `vikunja_update_task` to close or update.

## Transition Status

PlooTunes is migrating from an Electron/SQLite desktop app to a self-hosted web app (Postgres + Express + Drizzle + Vite/React), mirroring the sibling **primal** repo.

During the migration:
- `src/{core,electron,react,mobile}` still exist and the old Electron app still works
- The new `packages/{shared,server,client}` stack is **not bootable** until later tickets
- Each part of `src/` will be removed as its port ticket completes
- The **museum/** directory preserves retired Electron-era machinery (see [Museum](#museum) below)

## Node Version

- **New packages** (`packages/`) target **Node 22** (consistent with primal)
- The **legacy Electron build** (`src/electron`) still needs **Node 20** for the `sqlite3` native build

## Architecture

Router → Adapter → Service → DAO. No business logic in routers or adapters — all business logic (including orchestration across services) lives in services. See [Adapters](#adapters) for the layer contract.

### New web-app layout

```
packages/
  shared/   — types, Zod schemas, enums (no sqlite, no DB deps)
  server/   — Express + Drizzle; dao/, services/, adapters/, routes/; daoFactory.ts + serviceFactory.ts + adapterFactory.ts; db/{index,schema,migrate}; dbUpdates/
  client/   — Vite/React renderer; services/ → apiFetch; uses @ploot/pds
```

## Key Conventions

The server is a strict four-layer stack: `router → adapter → service → dao`. Each layer below is
listed top-to-bottom in call order, with its **Responsibilities** and **Guardrails**.

### Router

**Responsibilities**
- One file per domain in `packages/server/src/routes/`
- Export a factory function `createXRouter(adapters: AppAdapters): Router` — never a singleton router
- Authn/authz, request validation (Zod), and HTTP responses — including domain-error → status mapping (e.g. `SubscriptionOverlapError` → `409`)
- Validate/coerce query params using the enum values arrays

**Guardrails**
- Takes `AppAdapters`, and `AppServices` as well **only** when it also serves primitive/boolean/void responses that skip the adapter (call the service directly for those)
- No business logic
- Never builds a DTO — DTO-bearing responses are always produced by delegating to the adapter (`adapters.xAdapter.method(...)`)

### Adapter

**Responsibilities**
- One file per domain in `packages/server/src/adapters/`
- Export `IXAdapter` interface and `XAdapter` class; `XAdapter` takes `AppServices` via constructor injection
- Converts service domain types → DTOs (and, rarely, request values → service inputs)
- The `toXDto` mapping function lives in the adapter file, module-private, unless shared (see below)
- Wire every new adapter into `AppAdapters` and `createAdapters()` in `packages/server/src/adapterFactory.ts`

**Guardrails**
- Full member of the stack, in the call path — not a passthrough
- **One service, then transform** — an adapter method calls exactly **one** service, then maps the result
- **Dispatch rule** — an adapter may pick between that one service's methods **only** when the decision is made purely from data the router passed in (e.g. a present-or-absent `artistId`). It is **forbidden** from calling anything to obtain data to make that decision — if choosing the path requires a lookup, that's business logic and belongs in a service
- **Never `try/catch`** — all errors pass straight through to the router, which is the only layer that maps domain errors → HTTP status
- **Shared mappers** — a `toXDto` may be **exported** and imported by another adapter only when the DTO is produced identically. The moment a consumer needs even one field different, it owns a separate mapper in its own adapter — no branching/parameterized shared mappers
- No HTTP concerns, no I/O beyond the single service call

### Service

**Responsibilities**
- One file per domain in `packages/server/src/services/`
- Export `IXService` interface and `XService` class; `XService` takes `AppDaos` via constructor injection
- Import row types from DAO files (`../dao/xDao.ts`), not from drizzle-orm or schema
- All business logic, including orchestration across DAOs (and, rarely, other services)
- Wire every new service into `AppServices` and `createServices()` in `packages/server/src/serviceFactory.ts`

**Guardrails**
- Returns **server-internal domain types**, never DTOs. When a response needs data assembled from multiple sources, the owning service orchestrates it and returns an intermediate aggregate type (defined alongside the service, like `XRow` lives with the DAO) — never in `shared`
- **Highly prefer composing DAOs directly.** A service may inject another service, but only when genuinely necessary — you need that service's *business logic* (not just its data) and want to stay DRY. (Example: `PlaybackService` injects `QueueService` for `setShuffled`'s logic.)
- **Factory discipline** — every constructor parameter in `serviceFactory.ts` must be a service or DAO. Never inject raw callbacks, primitives, or ad-hoc values. If a concern needs injecting, give it a service. Build services in dependency order so an injected service instance is already constructed when it's needed.

### DAO

**Responsibilities**
- One file per table in `packages/server/src/dao/`
- Export `IXDao` interface and `XDao` class; `XDao` takes `db: Database` via constructor injection
- Standard starting methods: `findAll` or `findByParentId`, `findById`, `create`
- Wire every new DAO into `AppDaos` and `createDaos()` in `packages/server/src/daoFactory.ts`

**Guardrails**
- Drizzle types (`InferSelectModel`, `InferInsertModel`) are only used inside DAO files — never import them in services, adapters, or routers
- Type aliases (`XRow` for select, `NewX` for insert) are exported so services can import them from the DAO file

### DTOs & Schemas
- All DTOs are derived via `z.infer<typeof xResponseSchema>` — never hand-written interfaces
- Response schemas go in `packages/shared/src/schemas.ts` above the `// Input schemas` comment
- Composed/joined DTOs use Zod `.extend()` — only create them when an actual endpoint needs it
- Mapping from service domain types → DTOs happens in the adapter only (never in routers or services)

### Enums
- All enums live in `packages/shared/src/enums.ts`
- Always add a `PLURAL_VALUES = Object.values(EnumName)` array alongside the enum
- Use the array for Zod enums: `z.enum(VALUES as [string, ...string[]])`

### Factories
- Factory chain: `createAdapters(services) → createServices(daos) → createDaos()`, wired in `packages/server/src/adapterFactory.ts` / `serviceFactory.ts` / `daoFactory.ts` respectively, and assembled in `index.ts`

### Frontend Services
- One file per domain in `packages/client/src/services/`
- Export a class with static methods only: `XService.method()` — never instantiated
- Import DTO types from `@ploot/plootunes-shared`

### Pages
- Every route-level page component must use `<Page title="...">` from `@ploot/pds` as its root element
- `Page` provides the standard title header bar and automatic `overflow-y: auto` scrolling
- Never use a raw `<div>` + manual `<h1>` as a page root

### Styling
- Colocated SCSS files per component/page — no inline styles
- Import the SCSS file directly (not as a module): `import './myComponent.scss'`
- Use BEM-style class naming: `.block__element--modifier`
- Use PDS CSS variables for spacing, color, radius, etc. (`var(--pds-space-sm)`, `var(--pds-color-primary)`, etc.)
- NEVER use raw primitives if there is a token (do not use `padding: 16px`, use `padding: var(--pds-space-md)`)
- NEVER use raw HTML elements (`<button>`, `<select>`, etc.) — always prefer PDS components (`<Button>`, `<Dropdown>`)
- The only exception to no-inline-styles is dynamic values driven by data (e.g. `style={{ background: track.color }}`)
- Use `classMerge` from `@ploot/pds` for conditional class names — never string concatenation

### JSX Patterns
- Use `{condition && <Component />}` for conditional rendering — never ternaries for JSX branches
- Ternaries are only acceptable for simple inline values (e.g. a class name or string), never for choosing between components or blocks of JSX

### TypeScript / Imports
- All relative imports use `.ts` extensions (not `.js`) — `rewriteRelativeImportExtensions: true` is set in `tsconfig.base.json`
- `@ploot/plootunes-shared` points directly to `src/index.ts` — no build step needed when changing shared code

### Auth
- Auth uses Authentik OIDC + session middleware
- Authenticated user ID is available as `req.userId` in all route handlers
- `isAdmin` is a stub defaulting to the Emperor (`00000000-0000-0000-0000-000000000001`) until real admin management is built

### Drizzle Migrations
- **NEVER hand-author migration SQL.** Always update `packages/server/src/db/schema.ts` first, then run `pnpm db:generate` to let drizzle-kit generate the migration file in `dbUpdates/`. Hand-writing skips the snapshot, causing the next `db:generate` to re-diff against a stale snapshot and emit a duplicate migration.
- Apply with `pnpm db:migrate`.
- Never apply schema changes manually — always go through `db:generate` + `db:migrate`.

## Commands

```sh
# Install all workspace dependencies (new packages/ stack)
pnpm install   # always --frozen-lockfile in CI

# Typecheck all packages
pnpm typecheck   # shortcut for pnpm -r --if-present typecheck

# Test all packages
pnpm -r test

# Integration tests (boots a testcontainers Postgres, applies migrations, runs the vitest integration tier)
pnpm test:integration
# Feature tickets import shared seed/reset utilities from packages/server/src/__tests__/integration/helpers.ts

# Drizzle migrations (run from repo root)
pnpm db:generate   # generates migration from schema.ts changes
pnpm db:migrate    # applies pending migrations

# E2E stack
pnpm app:up        # boot baseline e2e instance (docker compose up --build)
pnpm app:down      # tear down and discard ephemeral DB (docker compose down -v)
pnpm test:e2e      # run Playwright suite (stack must be running) — NOT bootable until T13

# Lint / format (new packages/ only)
pnpm lint
pnpm format

# Legacy Electron commands (still work during transition)
npm run react        # Vite dev server on port 3000
npm run electron     # Electron process (expects React on :3000)
npm test             # Jest suite for legacy src/
npm run install:all  # installs root + src/electron + src/react
npx jest path/to/test.spec.ts   # single test file
```

## E2E Testing

> **Skeleton — not bootable yet.** The e2e harness (compose, seeds, `pnpm app:up`/`test:e2e`) is documented here and scaffolded under `e2e/`, but it is activated in ticket **T13**. `pnpm test:e2e` currently prints a reminder and exits non-zero.

See `e2e/README.md` for the full workflow.

- **Spin up:** `pnpm app:up` — boots clean postgres, runs migrations, applies baseline seed, starts server + client at port 3100
- **Run tests:** `pnpm test:e2e` (stack must be running)
- **Interactive verification:** Beyond the spec suite, drive the live stack via the **Playwright MCP** (`browser_navigate` → `browser_snapshot` → `browser_take_screenshot` → `browser_console_messages` → interact). For any non-trivial feature, this interactive pass should typically always be done once development is finished — it catches broken assets, 404s, and console errors a passing spec suite and clean typecheck miss.
- **DB state verification:** `docker exec docker-postgres-1 psql -U plootunes -d plootunes -c "SELECT ..."` — always verify writes at the DB level, not just the UI.
- **Tear down:** `pnpm app:down`
- **Scenario usage:** `SCENARIO=shuffled-queue pnpm app:up`
- **Auth bypass:** `PLOOTUNES_AUTH_BYPASS=true` is set in the e2e compose. The server injects `PLOOTUNES_E2E_USER_ID` on every request — no login needed. Throws on startup if `NODE_ENV=production`. **Never set this in prod.**

## Museum

`museum/` preserves retired-but-beloved machinery from the Electron era. It is excluded from build, lint, and formatting passes. Originals remain in `src/` until their port ticket removes them. See `museum/README.md` for the exhibit index.

## Definition of Done

A feature or change is not done until:
- All requirements are satisfied
- `pnpm typecheck` passes clean
- `pnpm lint` passes
- `pnpm exec prettier --check 'packages/*/src/**/*.{ts,tsx,scss}'` passes
- No existing tests are broken (`npm test` for legacy, `pnpm -r test` for new packages)
- Interactive e2e verification done for any non-trivial UI feature

### Empirical verification (mandatory)

**Every piece of work must be verified empirically whenever it is reasonably feasible to do so.** If you can actually run the thing, you must run it — do not substitute a clean typecheck, a passing lint, a faithful code port, or a green unit test for proof that the behavior actually works.

- Unit and integration tests are still required — this is *in addition* to them, not a replacement.
- If a ticket's acceptance criteria describe observable runtime behavior (e.g. "the server boots", "an unauthenticated request returns 401", "the endpoint returns X"), you must actually execute that behavior and observe the result before calling the work done — boot the server and hit the route, run the flow, curl the endpoint, drive the UI. Passing tests around the change do not count as having exercised the change itself.
- Only skip empirical verification when it is genuinely not feasible (e.g. requires prod-only infrastructure that cannot run here), and when you skip it, say so explicitly rather than implying it was checked.
