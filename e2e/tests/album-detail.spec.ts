import { test, expect } from '@playwright/test'

test('album tiles render real cover art with no failed asset or API requests', async ({ page }) => {
  const failedRequests: string[] = []
  page.on('response', (res) => {
    const url = res.url()
    if ((url.includes('/covers/') || url.includes('/api/')) && res.status() >= 400) {
      failedRequests.push(`${res.status()} ${url}`)
    }
  })

  await page.goto('/albums')

  // Every seeded album has pre-generated cover art, so each tile must show a real
  // /covers/ thumbnail. A decoded width of 0 catches an <img> that resolved but
  // failed to render — the failure mode a plain visibility check misses.
  const covers = page.locator('.p-tile img[src^="/covers/"]')
  await expect(covers.first()).toBeVisible()
  expect(await covers.count()).toBe(await page.locator('.p-tile').count())
  for (const cover of await covers.all()) {
    expect(await cover.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  }

  expect(failedRequests).toEqual([])
})

test('clicking an album tile opens its detail overlay with a populated songs grid', async ({
  page,
}) => {
  await page.goto('/albums')
  await page
    .locator('.p-tile', { has: page.locator('.album-name', { hasText: 'Abbath' }) })
    .first()
    .click()

  // Album detail is an overlay, not a route — there is no /albums/:id URL.
  const overlay = page.locator('.p-overlay-view')
  await expect(overlay).toBeVisible()
  await expect(overlay.locator('.pds-page-header__main-title')).toHaveText('Abbath')
  // The overlay renders SongsGrid without displayAlbumInfo, so it has no Album
  // column and therefore no cover art — assert on rows, not images.
  await expect(
    overlay.locator('.ReactVirtualized__Table__row.virtualized-song-grid-row').first(),
  ).toBeVisible()
})
