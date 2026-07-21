# Scenario: big-library

## Goal

Boot with the full stub library — **3026 songs, 166 artists, 373 albums** — layered on the baseline, for testing pagination, virtualization, and scan performance against a realistic catalog size.

## Usage

```sh
SCENARIO=big-library pnpm app:up
```

## Resulting state

- The baseline's small catalog (Abbath, Amon Amarth, Sabaton, Æther Realm, Fake Album, Aephanemer) plus every other artist in the stub library.
- User 1's per-artist subscriptions are replaced with a single subscription covering all of `/app/media` — every song in the library is visible to user 1.
- User 2's baseline subscription to `Aephanemer` is left untouched.

## Files

- **`01-patch.sql`** — generated, never hand-written. Catalog rows only.
- **`02-subscriptions.sql`** — the hand-written subscription swap, kept separate so regenerating `01` never clobbers it. Applied after `01` by filename order.

## Regenerating `01-patch.sql`

```sh
node e2e/tools/generateCatalog.mjs \
  e2e/scenarios/big-library/assets/media /app/media --on-conflict \
  > e2e/scenarios/big-library/01-patch.sql
```

`--on-conflict` puts `ON CONFLICT DO NOTHING` on every insert so the patch layers safely over the baseline's overlap (all six baseline artists exist in both trees). That is only safe because IDs are UUIDv5 over each entity's natural key: the same artist name yields the same UUID in both trees, so a row skipped as a duplicate is one this patch's songs can still reference. With random IDs those songs would point at an artist that was never inserted and the patch would fail on the foreign key.

No `--covers-out` here: these stubs carry no embedded art, so their albums seed `cover_image` NULL and the client falls back to its placeholder. See the note in `e2e/README.md` about those fallback images 404-ing.

## Notes for testers

- `docker exec docker-postgres-1 psql -U plootunes -d plootunes -c "SELECT count(*) FROM song;"` should show the full stub count.
- `/songs` should render (virtualized) without needing to scroll through the whole catalog to confirm it's there.
