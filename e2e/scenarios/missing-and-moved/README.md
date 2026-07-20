# Scenario: missing-and-moved

## Goal

Exercise the admin missing/relink/hard-remove surface. Seeds two songs already flagged `missing = true` with paths that do not exist on disk:

- `Missing No History` — no `play_event` rows. `hard-remove` deletes it outright.
- `Missing With History` — has a `play_event`. `hard-remove` tombstones it (`removed = true`) instead of deleting, because `play_event.song_id` is `ON DELETE RESTRICT`.

## Usage

```sh
SCENARIO=missing-and-moved pnpm app:up
```

## Why the boot scan doesn't touch these rows

`scanService.performScan`'s missing-sweep only flags catalog rows that are **not already missing** and are absent from the current walk (`!row.missing && !walkedPaths.has(path)`). Since these rows are seeded already-missing, the boot scan leaves them exactly as seeded — `GET /api/library/missing` has content immediately after boot, with no race against the async startup scan.

## Exercising hash-relink manually

Auto content-hash relink (a moved file resolving to its old row) is **not** staged by this scenario on purpose — a matching orphan file would let the boot scan auto-relink it and consume the scenario before a tester could exercise it. To test relink:

1. Boot with this scenario.
2. Move (or copy) a real file into the container at one of the missing paths above.
3. `POST /api/library/scan` to trigger a manual rescan, or use `POST /api/library/:songId/relink` directly.

## Notes for testers

- `GET /api/library/missing` — both songs listed.
- `POST /api/library/<no-history-id>/hard-remove` → `{"outcome":"deleted"}` and the row is gone.
- `POST /api/library/<with-history-id>/hard-remove` → `{"outcome":"tombstoned"}` and the row still exists with `removed = true`.
- `req.isAdmin` is hardcoded `true` under the auth bypass, so these admin-gated routes are reachable with no login.
