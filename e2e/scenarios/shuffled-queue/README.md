# Scenario: shuffled-queue

## Goal

Test that the player correctly restores shuffle state from a persisted queue. The scenario seeds user 1 (Emperor) mid-shuffle over the baseline's Abbath album: the queue has a populated `play_order` (the reverse of `song_ids`), a cursor pointing partway into that order, and a non-zero `position_ms` for the current song.

## Usage

```sh
SCENARIO=shuffled-queue pnpm app:up
```

## Layered-patch convention

Scenarios extend the baseline using numbered SQL patches applied in filename order after the baseline seed runs. Assets are merged on top of the baseline `MEDIA_ROOT`.

```
e2e/scenarios/<name>/
  01-patch.sql          # First patch (applied after baseline)
  02-patch.sql          # Second patch (applied after 01, if present)
  assets/
    media/               # Extra media merged into MEDIA_ROOT
  README.md
```

This scenario uses a single `01-patch.sql` because the shuffled-queue state is a single self-contained addition on top of the baseline catalog.

## Resulting state

- Baseline canonical catalog intact
- User 1's queue: `song_ids` = Abbath's 10 tracks in path order, `play_order` = the same 10 UUIDs in reverse
- `playback_state.cursor = 3`, `position_ms = 800`, `shuffled = true`
- The song at `play_order[3]` — **not** `song_ids[3]` — is the "currently playing" track. `queue.cursor` always indexes `play_order ?? song_ids`, so a test that reads `song_ids[3]` instead of `play_order[3]` is checking the wrong song.

## Notes for testers

- Navigate to the player and verify the correct song (from `play_order`, index 3) is shown as "now playing"
- Verify the progress bar reflects the seeded `position_ms` (800ms)
- Verify next/previous respect the shuffled `play_order`, not path order
