-- Scenario: missing-and-moved
--
-- Seeds two songs already flagged missing, pointing at paths that do not
-- exist on disk. The boot scan's missing-sweep only flags rows that are NOT
-- already missing (see scanService.performScan), so these rows are left
-- alone by the scan and GET /api/library/missing has content immediately.
-- One carries a play_event so POST /:songId/hard-remove returns 'tombstoned'
-- rather than 'deleted' (song.id restrict on play_event.song_id).

INSERT INTO song (path, content_hash, mtime, missing, missing_at, removed, name, track_number, disc_number, duration_ms, artist_id, album_id)
VALUES
  (
    '/app/media/Abbath/__missing_no_history.mp3',
    'deadbeef0000000000000000000000000000000000000000000000000000aaaa',
    0,
    true,
    now(),
    false,
    'Missing No History',
    99,
    1,
    1632,
    (SELECT id FROM artist WHERE name = 'Abbath'),
    NULL
  ),
  (
    '/app/media/Abbath/__missing_with_history.mp3',
    'deadbeef0000000000000000000000000000000000000000000000000000bbbb',
    0,
    true,
    now(),
    false,
    'Missing With History',
    98,
    1,
    1632,
    (SELECT id FROM artist WHERE name = 'Abbath'),
    NULL
  );

INSERT INTO play_event (user_id, song_id, played_at, ms_played)
SELECT '00000000-0000-0000-0000-000000000001', id, now() - interval '3 days', 1600
FROM song WHERE path = '/app/media/Abbath/__missing_with_history.mp3';
