-- Scenario: big-library — subscription swap
--
-- 01-patch.sql is generated (e2e/tools/generateCatalog.mjs) and holds catalog
-- rows only. This file is the hand-written fixture that pairs with it, kept
-- separate so regenerating the catalog never clobbers it.
--
-- The baseline subscribes user 1 to five specific artist folders. That would
-- leave the other ~160 artists invisible, since membership is derived by path
-- prefix (dao/libraryMembership.ts) rather than materialized. Swap those rows
-- for a single subscription at the media root so the whole catalog is in the
-- user's library — which is the entire point of this scenario.

DELETE FROM user_library_source WHERE user_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO user_library_source (user_id, folder_path) VALUES
  ('00000000-0000-0000-0000-000000000001', '/app/media');
