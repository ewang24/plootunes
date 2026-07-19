export function coverUrl(coverImage: string): string {
  return `/covers/${coverImage}`
}

export function thumbUrl(coverImage: string): string {
  const basename = coverImage.replace(/\.[^./]+$/, '')
  return `/covers/${basename}_thumb.webp`
}
