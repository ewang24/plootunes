-- Scenario: multi-user
--
-- Adds divergent per-user state on top of the baseline's already-divergent
-- subscriptions (user 1 owns Abbath/Amon Amarth/Sabaton/Æther Realm/Fake
-- Album; user 2 owns Aephanemer exclusively): separate queues, play history,
-- and widgets for each user. Songs are referenced by path, never by UUID.

INSERT INTO queue (user_id, song_ids, play_order)
SELECT
  '00000000-0000-0000-0000-000000000001',
  ARRAY(SELECT id FROM song WHERE path LIKE '/app/media/Sabaton/%' ORDER BY path),
  NULL
ON CONFLICT (user_id) DO UPDATE SET song_ids = EXCLUDED.song_ids, play_order = EXCLUDED.play_order;

INSERT INTO playback_state (user_id, cursor, position_ms, shuffled, repeat)
VALUES ('00000000-0000-0000-0000-000000000001', 1, 500, false, 'off')
ON CONFLICT (user_id) DO UPDATE SET
  cursor = EXCLUDED.cursor,
  position_ms = EXCLUDED.position_ms,
  shuffled = EXCLUDED.shuffled;

INSERT INTO queue (user_id, song_ids, play_order)
SELECT
  '00000000-0000-0000-0000-000000000002',
  ARRAY(SELECT id FROM song WHERE path LIKE '/app/media/Aephanemer/%' ORDER BY path),
  NULL
ON CONFLICT (user_id) DO UPDATE SET song_ids = EXCLUDED.song_ids, play_order = EXCLUDED.play_order;

INSERT INTO playback_state (user_id, cursor, position_ms, shuffled, repeat)
VALUES ('00000000-0000-0000-0000-000000000002', 0, 200, false, 'off')
ON CONFLICT (user_id) DO UPDATE SET
  cursor = EXCLUDED.cursor,
  position_ms = EXCLUDED.position_ms,
  shuffled = EXCLUDED.shuffled;

INSERT INTO play_event (user_id, song_id, played_at, ms_played)
SELECT '00000000-0000-0000-0000-000000000001', id, now() - interval '1 day', 1200
FROM song WHERE path LIKE '/app/media/Sabaton/%' ORDER BY path LIMIT 1;

INSERT INTO play_event (user_id, song_id, played_at, ms_played)
SELECT '00000000-0000-0000-0000-000000000002', id, now() - interval '2 hours', 1600
FROM song WHERE path LIKE '/app/media/Aephanemer/%' ORDER BY path LIMIT 1;

-- widget_type is unvalidated text server-side; the client renders anything it
-- does not recognise as a literal "Unknown Widget" tile. These must match the
-- values in client/src/view/landing/widgetTypes.ts.
INSERT INTO widget (widget_type, display_order, user_id) VALUES
  ('QUICK_PLAY', 0, '00000000-0000-0000-0000-000000000001'),
  ('PLAY_HISTORY', 1, '00000000-0000-0000-0000-000000000001'),
  ('RECENTLY_ADDED', 0, '00000000-0000-0000-0000-000000000002');
