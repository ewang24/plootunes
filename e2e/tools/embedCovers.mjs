// One-shot tool: embeds a distinct solid-colour cover into each baseline
// album's tracks so the e2e boot scan has real embedded art to extract via
// scanService.writeCover(). Run once, then commit the resulting mp3s —
// this script is not part of the boot/entrypoint path.
//
// Run from the repo root (needs sharp + node-id3, which live in
// packages/server/node_modules):
//
//   NODE_PATH="$(pwd)/packages/server/node_modules:$(pwd)/node_modules" \
//     node e2e/tools/embedCovers.mjs e2e/baseline/assets/media

import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require('sharp')
const NodeID3 = require('node-id3')

const COVER_SIZE_PX = 400
// A distinct hue per album directory, cycled if there are more albums than colors.
const COLORS = [
  { r: 220, g: 60, b: 60 },
  { r: 60, g: 140, b: 220 },
  { r: 60, g: 200, b: 120 },
  { r: 230, g: 180, b: 40 },
  { r: 160, g: 80, b: 200 },
  { r: 40, g: 190, b: 190 },
  { r: 230, g: 120, b: 60 },
  { r: 120, g: 120, b: 120 },
  { r: 200, g: 60, b: 160 },
  { r: 100, g: 160, b: 60 },
]

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const filesByDir = new Map()
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      for (const [d, files] of await walk(entryPath)) filesByDir.set(d, files)
    } else if (entry.name.toLowerCase().endsWith('.mp3')) {
      if (!filesByDir.has(dir)) filesByDir.set(dir, [])
      filesByDir.get(dir).push(entryPath)
    }
  }
  return filesByDir
}

async function main() {
  const mediaRoot = process.argv[2]
  if (!mediaRoot) {
    console.error('Usage: node embedCovers.mjs <media-dir>')
    process.exit(1)
  }

  const filesByDir = await walk(mediaRoot)
  const dirs = [...filesByDir.keys()].sort()
  console.log(`Found ${dirs.length} album directories under ${mediaRoot}`)

  for (const [index, dir] of dirs.entries()) {
    const color = COLORS[index % COLORS.length]
    const jpegBuffer = await sharp({
      create: {
        width: COVER_SIZE_PX,
        height: COVER_SIZE_PX,
        channels: 3,
        background: color,
      },
    })
      .jpeg()
      .toBuffer()

    for (const filePath of filesByDir.get(dir)) {
      const existingTags = NodeID3.read(filePath)
      const ok = NodeID3.update(
        {
          ...existingTags,
          image: {
            mime: 'image/jpeg',
            type: { id: 3, name: 'front cover' },
            description: 'Cover',
            imageBuffer: jpegBuffer,
          },
        },
        filePath,
      )
      if (!ok) throw new Error(`Failed to write cover into ${filePath}`)
    }
    console.log(`  ${dir} (${filesByDir.get(dir).length} tracks) -> rgb(${color.r},${color.g},${color.b})`)
  }

  console.log('Done.')
}

await main()
