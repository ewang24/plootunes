import { test, expect } from '@playwright/test'

// SongsGrid is a react-virtualized Table whose rowClassName also lands on the
// header row, so `.virtualized-song-grid-row` alone matches the header first.
// Data rows are the ones that also carry ReactVirtualized__Table__row.
const DATA_ROW = '.ReactVirtualized__Table__row.virtualized-song-grid-row'

test('playing a song from the songs grid starts playback and updates the queue', async ({
  page,
}) => {
  await page.goto('/songs')

  await page.locator(DATA_ROW).first().getByTitle('Play').click()

  const audioSource = page.locator('audio source')
  await expect(audioSource).toHaveAttribute('src', /\/api\/audio\/[^/]+\/stream$/)

  // The baseline stubs are ~1.6s long, so playback auto-advances to the next
  // track faster than the assertions below can run. Pause so "now playing" is a
  // stable value rather than a moving target.
  await page.locator('audio').evaluate((el: HTMLAudioElement) => el.pause())

  // The player is the source of truth for "now playing"; asserting the queue
  // echoes it verifies both views agree, without scraping a grid cell by index.
  const nowPlaying = page.locator('.player-controls strong')
  await expect(nowPlaying).not.toBeEmpty()
  const songName = (await nowPlaying.innerText()).trim()

  await page.getByTitle('Show Queue').click()
  const currentRow = page.locator('.queue-viewer-row', { has: page.locator('.currently-playing') })
  await expect(currentRow).toBeVisible()
  await expect(currentRow.locator('.currently-playing')).toContainText(songName)
})

test('the audio stream endpoint honours range requests', async ({ page, request }) => {
  await page.goto('/songs')
  await page.locator(DATA_ROW).first().getByTitle('Play').click()

  const src = await page.locator('audio source').getAttribute('src')
  expect(src).toBeTruthy()

  const partial = await request.get(src!, { headers: { Range: 'bytes=0-99' } })
  expect(partial.status()).toBe(206)
  expect((await partial.body()).length).toBe(100)
})
