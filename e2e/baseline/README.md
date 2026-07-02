# PlooTunes E2E Baseline

The baseline is seeded from real data scraped from the dev DB. It contains the shared canonical music catalog — a curated set of artists, albums, songs, and genres with real cover art and audio under `MEDIA_ROOT` — plus pre-seeded users.

## Scrape-to-seed approach

Baseline data is never hand-written. It is derived from the dev DB using repeatable `psql` scrape queries that produce `INSERT` statements. This ensures the baseline is always internally consistent (foreign keys, UUIDs, etc.) and can be regenerated when the schema changes.

## Regenerating the baseline

When the schema changes (new table, new column, renamed column):

1. Apply the schema migration to your local dev DB.
2. Update `seed.sql` by re-running the psql scrape queries against the dev DB.
3. If new asset types are added (new cover/audio directories), update the asset copy step in the entrypoint script accordingly.
4. Run `pnpm app:up` and verify the seed applies cleanly before committing.

> Scrape queries will be documented here once the schema is defined (T13+).

## Asset sources

Cover art and audio files referenced by the seed live under `MEDIA_ROOT` on the dev machine. The e2e entrypoint copies them into the container at startup. Paths follow the same convention as the server's `MEDIA_ROOT` env var.
