-- Scenario: shuffled-queue
--
-- Seeds user 1 (Emperor) mid-shuffle over the baseline's Abbath album: song_ids
-- in library (path) order, play_order a distinct permutation of the same
-- UUIDs, a cursor mid-way through the shuffled order, and a non-zero position
-- within the current song. Songs are referenced by path, never by UUID, so
-- this patch survives catalog regeneration.

INSERT INTO queue (user_id, song_ids, play_order)
SELECT
  '00000000-0000-0000-0000-000000000001',
  ARRAY(SELECT id FROM song WHERE path LIKE '/app/media/Abbath/%' ORDER BY path),
  ARRAY(SELECT id FROM song WHERE path LIKE '/app/media/Abbath/%' ORDER BY path DESC)
ON CONFLICT (user_id) DO UPDATE SET song_ids = EXCLUDED.song_ids, play_order = EXCLUDED.play_order;

INSERT INTO playback_state (user_id, cursor, position_ms, shuffled, repeat)
VALUES ('00000000-0000-0000-0000-000000000001', 3, 800, true, 'off')
ON CONFLICT (user_id) DO UPDATE SET
  cursor = EXCLUDED.cursor,
  position_ms = EXCLUDED.position_ms,
  shuffled = EXCLUDED.shuffled;
