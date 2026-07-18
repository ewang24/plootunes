import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { z } from 'zod'
import type { AppAdapters } from '../adapterFactory.ts'
import type { AppServices } from '../serviceFactory.ts'
import { librarySubscriptionCreateSchema, libraryRelinkSchema } from '@ploot/plootunes-shared'
import {
  SubscriptionOverlapError,
  SongNotFoundError,
  SongNotRecoverableError,
  RelinkFileNotFoundError,
} from '../services/libraryService.ts'
import { ScanAlreadyRunningError, SUPPORTED_AUDIO_EXTENSIONS } from '../services/scanService.ts'

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAdmin) {
    res.sendStatus(403)
    return
  }
  next()
}

// Computed per-request (not module-load time) so tests overriding LIBRARY_UPLOAD_DIR
// / MEDIA_ROOT still land uploads in the right temp directory.
function uploadTmpDir(): string {
  return path.join(
    process.env.LIBRARY_UPLOAD_DIR ?? path.join(process.env.MEDIA_ROOT ?? process.cwd(), 'uploads'),
    '.tmp',
  )
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const tmpDir = uploadTmpDir()
      fs.mkdir(tmpDir, { recursive: true }, (err) => cb(err, tmpDir))
    },
    filename: (_req, file, cb) => {
      cb(null, `${randomUUID()}${path.extname(file.originalname)}`)
    },
  }),
})

export function createLibraryRouter(adapters: AppAdapters, services: AppServices): Router {
  const router = Router()

  router.get('/subscriptions', async (req, res) => {
    res.json(await adapters.libraryAdapter.listSubscriptions(req.userId))
  })

  router.post('/subscriptions', async (req, res) => {
    const parsed = librarySubscriptionCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message })
      return
    }

    try {
      const dto = await adapters.libraryAdapter.subscribe(req.userId, parsed.data.folderPath)
      res.status(201).json(dto)
    } catch (e) {
      if (e instanceof SubscriptionOverlapError) {
        res.status(409).json({ error: e.message })
        return
      }
      throw e
    }
  })

  router.delete('/subscriptions/:id', async (req, res) => {
    const parsedId = z.string().uuid().safeParse(req.params.id)
    if (!parsedId.success) {
      res.sendStatus(404)
      return
    }

    const ok = await services.libraryService.unsubscribe(req.userId, parsedId.data)
    res.sendStatus(ok ? 204 : 404)
  })

  router.post('/scan', requireAdmin, async (req, res) => {
    try {
      const dto = await adapters.scanAdapter.triggerScan()
      res.status(202).json(dto)
    } catch (e) {
      if (e instanceof ScanAlreadyRunningError) {
        res.status(409).json({ error: e.message })
        return
      }
      throw e
    }
  })

  router.post('/upload', requireAdmin, upload.single('file'), async (req, res) => {
    const ext = req.file ? path.extname(req.file.originalname).slice(1).toLowerCase() : ''
    if (!req.file || !SUPPORTED_AUDIO_EXTENSIONS.has(ext)) {
      if (req.file) await fs.promises.unlink(req.file.path).catch(() => undefined)
      res.status(400).json({ error: 'Unsupported or missing audio file' })
      return
    }

    const dto = await adapters.libraryAdapter.uploadTrack(req.file.path, req.file.originalname)
    res.status(201).json(dto)
  })

  router.get('/missing', requireAdmin, async (_req, res) => {
    res.json(await adapters.libraryAdapter.listMissing())
  })

  router.post('/:songId/relink', requireAdmin, async (req, res) => {
    const parsedId = z.string().uuid().safeParse(req.params.songId)
    if (!parsedId.success) {
      res.sendStatus(404)
      return
    }

    const parsedBody = libraryRelinkSchema.safeParse(req.body)
    if (!parsedBody.success) {
      res.status(400).json({ error: parsedBody.error.message })
      return
    }

    try {
      const dto = await adapters.libraryAdapter.relink(parsedId.data, parsedBody.data.path)
      res.json(dto)
    } catch (e) {
      if (e instanceof SongNotFoundError) {
        res.sendStatus(404)
        return
      }
      if (e instanceof SongNotRecoverableError) {
        res.status(409).json({ error: e.message })
        return
      }
      if (e instanceof RelinkFileNotFoundError) {
        res.status(400).json({ error: e.message })
        return
      }
      throw e
    }
  })

  router.post('/:songId/hard-remove', requireAdmin, async (req, res) => {
    const parsedId = z.string().uuid().safeParse(req.params.songId)
    if (!parsedId.success) {
      res.sendStatus(404)
      return
    }

    try {
      const dto = await adapters.libraryAdapter.hardRemove(parsedId.data)
      res.json(dto)
    } catch (e) {
      if (e instanceof SongNotFoundError) {
        res.sendStatus(404)
        return
      }
      if (e instanceof SongNotRecoverableError) {
        res.status(409).json({ error: e.message })
        return
      }
      throw e
    }
  })

  return router
}
