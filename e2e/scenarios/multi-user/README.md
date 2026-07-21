# Scenario: multi-user

## Goal

Exercise multi-user isolation beyond the baseline's already-divergent library subscriptions (user 1 owns Abbath/Amon Amarth/Sabaton/Æther Realm/Fake Album; user 2 owns Aephanemer exclusively). This scenario gives each user their own queue, playback position, play history, and widgets, so any per-user endpoint has real divergent data to isolate.

## Usage

```sh
SCENARIO=multi-user pnpm app:up
```

## Resulting state

- User 1: queue of Sabaton tracks, cursor 1, one `play_event`, two widgets (`QUICK_PLAY`, `PLAY_HISTORY`)
- User 2: queue of Aephanemer tracks, cursor 0, one `play_event`, one `RECENTLY_ADDED` widget

Under `PLOOTUNES_AUTH_BYPASS`, every request is authenticated as user 1 — user 2's rows exist purely as isolation-boundary data verified at the DB level or via a future admin surface, not something the running app itself renders for the bypass identity.

## Notes for testers

- `docker exec docker-postgres-1 psql -U plootunes -d plootunes -c "SELECT user_id, cursor FROM playback_state;"` shows both users' divergent playback state.
- `SELECT user_id, widget_type FROM widget;` shows three widgets total: two for user 1, one for user 2.
