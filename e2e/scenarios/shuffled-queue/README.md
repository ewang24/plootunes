# Scenario: shuffled-queue

## Goal

Test that the player correctly restores shuffle state from a persisted queue. The scenario seeds a user who is mid-shuffle: the queue has a populated `playOrder`, a non-zero cursor pointing into that order, and a non-zero `positionMs` for the current song.

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
    covers/             # Extra cover art merged into MEDIA_ROOT/covers
    audio/              # Extra audio merged into MEDIA_ROOT/audio
  README.md
```

This scenario uses a single `01-patch.sql` because the shuffled-queue state is a single self-contained addition on top of the baseline catalog.

## Resulting state (once populated in T13)

- Baseline canonical catalog intact
- One user (Emperor) with an active queue in shuffle mode
- `playOrder` populated with a permuted index over the queue's songs
- `cursor` pointing to a song mid-way through the shuffle order
- `positionMs` set to a non-zero offset within the current song

## Notes for testers

- Navigate to the player and verify the correct song is shown as "now playing"
- Verify the progress bar reflects the seeded `positionMs`
- Verify next/previous respect the shuffled `playOrder`, not album order
