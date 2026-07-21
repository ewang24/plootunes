# PlooTunes E2E Testing

Self-contained end-to-end test framework. Boots a fully-seeded PlooTunes instance in Docker using a shared canonical music catalog (songs, albums, artists) plus real cover art and audio under `MEDIA_ROOT`, then runs Playwright specs against it.

## Quick start

The simplest way to boot a seeded instance — for human testing, a demo, or working with the app on a fresh machine — is the root `app:up` / `app:down` scripts:

```sh
# Boot a baseline instance (canonical catalog, no login)
pnpm app:up

# Boot with a scenario layered on top of the baseline
SCENARIO=shuffled-queue pnpm app:up

# Stop and discard the ephemeral database (and covers)
pnpm app:down
```

The client is served at **http://localhost:3100** (no login — auth is bypassed).

### Running the Playwright suite

```sh
# 1. Boot the stack (leave it running)
pnpm app:up

# 2. In a separate terminal, run the specs
# @playwright/test is a root devDependency — install once with `pnpm install`.
pnpm test:e2e

# 3. Tear down when done
pnpm app:down
```

> `pnpm app:up` / `app:down` wrap `docker compose -f docker/docker-compose.e2e.yml up --build` / `down -v`. The scenario works through the same script because the compose passes `SCENARIO=${SCENARIO:-}` through — see [Scenarios](#scenarios) below.

## Interactive verification (Playwright MCP)

The `pnpm test:e2e` spec suite is the automated regression layer. It is **not** the same as driving the running app — a passing suite only proves the assertions that were written. To actually verify a feature, Claude should drive the live stack through the **Playwright MCP** (`browser_navigate`, `browser_snapshot`, `browser_take_screenshot`, `browser_click`, `browser_console_messages`, etc.).

**For any non-trivial feature, this interactive pass should typically always be done once development is finished** — before considering the work complete. It catches things the spec suite and a clean typecheck do not: broken images, 404s on derived assets, console errors, layout regressions, and visual correctness of seeded/scenario data.

The loop:

1. **Boot** the stack (baseline, or `SCENARIO=<name>` if the feature depends on a particular data shape).
2. **Navigate** to the relevant route with `browser_navigate`.
3. **Snapshot** the page (`browser_snapshot`) to assert on real rendered content, and **screenshot** (`browser_take_screenshot`) to confirm visual correctness — covers/audio actually load, not just that elements exist.
4. **Check the console** with `browser_console_messages` (level `error`). A page can look fine while 404-ing on assets — always check, don't trust the visible UI alone.
5. **Interact** — click through the feature path (open detail pages, start playback, apply a scenario) the way a user would.
6. **Tear down** with `down -v` when finished.

This is complementary to, not a replacement for, the spec suite: the suite guards against regressions over time; the MCP pass verifies the feature works right now.

## Known: placeholder cover images 404

When an album has no cover, the client falls back to raw relative paths (`'../../assets/img/test.jpg'` / `up.jpg` in `albumList.tsx`, `songsGrid.tsx`, `queueViewer.tsx`, `artistTile.tsx`, `albumsForArtists.tsx`). Those strings are not bundled by Vite, so the browser resolves them against the current URL and they 404.

The **baseline is unaffected** — every one of its albums has pre-generated cover art. It shows up under `SCENARIO=big-library`, whose stubs carry no embedded art.

This is a pre-existing client bug, not a harness one. Until it is fixed, scope network and image assertions to real derived assets — `img[src^="/covers/"]` — as `e2e/tests/album-detail.spec.ts` does, rather than asserting that no image on the page 404s.

## Auth bypass

The e2e compose sets `PLOOTUNES_AUTH_BYPASS=true`. This makes the server skip session checking and inject `PLOOTUNES_E2E_USER_ID` as the authenticated user on every request — no login screen needed.

**The bypass only works when `NODE_ENV` is not `production`.** If `NODE_ENV=production` and `PLOOTUNES_AUTH_BYPASS=true`, the server throws on startup. This is intentional and by design — the bypass must never reach prod.

## Scenarios

A scenario is a named directory under `e2e/scenarios/` that extends the baseline seed with additional SQL patches and/or assets.

```sh
# Boot with the shuffled-queue scenario
SCENARIO=shuffled-queue docker compose -f docker/docker-compose.e2e.yml up --build
```

Four scenarios are available: `shuffled-queue`, `big-library`, `multi-user`, `missing-and-moved`. See each scenario's `README.md` for what it seeds.

### Scenario layout

```
e2e/scenarios/<name>/
  01-patch.sql          # Applied after baseline seed (numbered for ordering)
  assets/
    media/               # Extra media merged into MEDIA_ROOT
  README.md             # What the scenario does and how to use it
```

SQL patches are applied in filename order. Asset directories are merged on top of the baseline assets.

## Baseline

The baseline is seeded from `e2e/baseline/seed.sql`. It contains the shared canonical catalog — artists, albums, and songs with no `userId` dependency — plus pre-seeded users and their `user_library_source` subscriptions. See `e2e/baseline/README.md` for the generated-catalog approach and regeneration instructions.

## DB state verification

When testing features that write to the database (mutations, migrations), query the e2e DB directly:

```sh
docker exec docker-postgres-1 psql -U plootunes -d plootunes -c "SELECT ..."
```

Don't rely solely on UI feedback — verify at the DB level.
