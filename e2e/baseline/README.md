# PlooTunes E2E Baseline

The baseline is a curated set of six artists — `Abbath`, `Aephanemer`, `Amon Amarth`, `Sabaton`, `Æther Realm`, and `Fake Album` — totalling **243 songs across 31 albums**, committed under `assets/media/` as `Artist/Album/track.mp3`. The audio files are ~1-second stubs carrying real ID3 tags and embedded cover art, so streaming, cover serving, and scanning all work against real bytes while the whole tree stays around 4 MB.

`Æther Realm` exercises non-ASCII NFC path normalization; `Fake Album` carries the missing-tag edge cases (no artist / no album / no title), which is why the catalog contains songs with a NULL `artist_id`, `album_id`, or `name`.

> The `big-library` scenario is a separate, flatter tree (`Artist/track.mp3`) holding the full 3026-song stub library, layered on top of this baseline. See `e2e/scenarios/big-library/README.md`.

## Users and subscriptions

| User | ID | `user_library_source` |
|---|---|---|
| ploot (Emperor) | `00000000-0000-0000-0000-000000000001` | Abbath, Amon Amarth, Sabaton, Æther Realm, Fake Album |
| vassal | `00000000-0000-0000-0000-000000000002` | Aephanemer *(exclusive — user 1 must never see it)* |

Under `PLOOTUNES_AUTH_BYPASS`, every request is authenticated as user 1. User 2's exclusive `Aephanemer` subscription exists purely as an isolation boundary, verified via `e2e/tests/multi-user-isolation.spec.ts` and DB queries.

## Covers

`album.cover_image` is seeded `NULL` for every album. The boot scan's `writeCover` (`packages/server/src/services/scanService.ts`) extracts the embedded ID3 art from each track (written once by `e2e/tools/embedCovers.mjs` — see below) and writes real cover bytes plus a `_thumb.webp`, with a random UUID filename **on every boot**. Specs must assert that a cover loads, never a specific URL.

## Generated-catalog approach

`seed.sql`'s catalog block (artist/album/genre/song/song_genre rows) is never hand-written. `e2e/tools/generateCatalog.mjs` walks the staged media, hashes each file, reads its ID3 tags, and emits the `INSERT`s — deriving exactly what `ScanService.prepareIngest` would derive from the same bytes. No database or running stack is involved, so regeneration is a single offline command.

Row IDs are **UUIDv5 over each entity's natural key** (`artist:<name>`, `album:<name> <albumArtistId>`, `song:<path>`). Two things follow:

- Rerunning the generator produces identical IDs, so a regeneration diff shows only genuine changes.
- A scenario layered on an overlapping baseline references exactly the UUIDs the baseline already inserted, which is what makes `--on-conflict`'s `ON CONFLICT DO NOTHING` safe. With random IDs, a skipped-as-duplicate artist would leave that scenario's songs pointing at an ID that was never inserted, and the patch would fail on the foreign key.

Everything else in `seed.sql` — users, `user_library_source`, the initial queue — references songs by **path**, via a `WHERE path LIKE '/app/media/<artist>/%'` subquery, never by UUID. Hand-written fixtures therefore survive a regeneration even if the ID derivation ever changes.

Because the generated `mtime` will not match the files once they are copied into the container, the boot scan matches every row by path and reduces to an in-place `updated` pass: IDs are preserved and the run reports `new=0, moved=0, missing=0`.

### Regenerating the catalog block

```sh
node e2e/tools/generateCatalog.mjs e2e/baseline/assets/media /app/media
```

Replace the `-- BEGIN GENERATED CATALOG` / `-- END GENERATED CATALOG` block in `seed.sql` wholesale with the output, then `pnpm app:up` to verify it applies cleanly.

The `big-library` scenario's `01-patch.sql` is the same command pointed at the full stub library, with `--on-conflict` because its rows overlap the baseline:

```sh
node e2e/tools/generateCatalog.mjs \
  e2e/scenarios/big-library/assets/media /app/media --on-conflict \
  > e2e/scenarios/big-library/01-patch.sql
```

That scenario's hand-written fixture lives in a separate `02-subscriptions.sql` so regenerating `01` never clobbers it.

## Regenerating embedded cover art

`e2e/tools/embedCovers.mjs` is a one-shot tool — it embeds a distinct solid-colour JPEG into every baseline track's ID3 tags via `sharp` + `node-id3`, grouped by album directory. It only needs to be re-run if new baseline media is added:

```sh
NODE_PATH="$(pwd)/packages/server/node_modules:$(pwd)/node_modules" \
  node e2e/tools/embedCovers.mjs e2e/baseline/assets/media
```

Commit the resulting mp3s — this script is not part of the boot/entrypoint path.

## Manually updating the baseline

When the schema changes (new table, new column, renamed column):

1. Apply the schema migration (`pnpm db:generate` + `pnpm db:migrate`).
2. Update the column lists in `e2e/tools/generateCatalog.mjs` to match.
3. Re-run the regeneration commands above (baseline, and `big-library` if catalog columns changed).
4. Run `pnpm app:up` and verify the seed applies cleanly before committing.
