import { test, expect } from '@playwright/test'

// The baseline itself makes subscription isolation visible: user 1 (the
// PLOOTUNES_AUTH_BYPASS identity) is subscribed to Abbath/Amon Amarth/Sabaton/
// Æther Realm/Fake Album; user 2 is subscribed to Aephanemer exclusively.
// Under the bypass the request identity is always fixed to user 1, so these
// assertions verify user 1's requests cannot see anything under user 2's
// exclusive Aephanemer subscription.

test('GET /api/songs excludes user 2-exclusive Aephanemer songs', async ({ request }) => {
  const res = await request.get('/api/songs')
  expect(res.ok()).toBe(true)
  const songs = (await res.json()) as { artistName?: string | null }[]
  expect(songs.some((s) => s.artistName === 'Aephanemer')).toBe(false)
})

test('GET /api/artists excludes the user 2-exclusive Aephanemer artist', async ({ request }) => {
  const res = await request.get('/api/artists')
  expect(res.ok()).toBe(true)
  const artists = (await res.json()) as { name: string }[]
  expect(artists.some((a) => a.name === 'Aephanemer')).toBe(false)
})

test('GET /api/albums excludes albums under the user 2-exclusive Aephanemer artist', async ({
  request,
}) => {
  const res = await request.get('/api/albums')
  expect(res.ok()).toBe(true)
  const albums = (await res.json()) as { artistName?: string | null }[]
  expect(albums.some((a) => a.artistName === 'Aephanemer')).toBe(false)
})
