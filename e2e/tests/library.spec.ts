import { test, expect } from '@playwright/test'

test('albums page shows the seeded catalog', async ({ page }) => {
  await page.goto('/albums')
  await expect(page.locator('.pds-page-header__main-title')).toHaveText('Your Albums')
  await expect(page.locator('.album-name', { hasText: 'Abbath' }).first()).toBeVisible()
  await expect(page.locator('.artist-name', { hasText: 'Abbath' }).first()).toBeVisible()
})

test('songs page shows the seeded catalog', async ({ page }) => {
  await page.goto('/songs')
  await expect(page.locator('.pds-page-header__main-title')).toHaveText('All Songs')
  await expect(page.locator('.virtualized-song-grid-row').first()).toBeVisible()
})

test('artists page shows the seeded catalog', async ({ page }) => {
  await page.goto('/artists')
  await expect(page.locator('.pds-page-header__main-title')).toHaveText('All Artists')
  await expect(page.locator('.artist-tile .artist-name', { hasText: 'Abbath' })).toBeVisible()
})

test('nav links move between library pages', async ({ page }) => {
  await page.goto('/home')
  await page.getByRole('link', { name: 'Albums' }).click()
  await expect(page).toHaveURL(/\/albums$/)
  await page.getByRole('link', { name: 'Songs' }).click()
  await expect(page).toHaveURL(/\/songs$/)
  await page.getByRole('link', { name: 'Artists' }).click()
  await expect(page).toHaveURL(/\/artists$/)
})
