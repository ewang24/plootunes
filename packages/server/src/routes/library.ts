import { Router } from 'express'
import { z } from 'zod'
import type { AppServices } from '../serviceFactory.ts'
import type { UserLibrarySourceRow } from '../dao/userLibrarySourceDao.ts'
import type { LibrarySubscriptionDTO } from '@ploot/plootunes-shared'
import { librarySubscriptionCreateSchema } from '@ploot/plootunes-shared'
import { SubscriptionOverlapError } from '../services/libraryService.ts'

function toLibrarySubscriptionDto(row: UserLibrarySourceRow): LibrarySubscriptionDTO {
  return {
    id: row.id,
    folderPath: row.folderPath,
  }
}

export function createLibraryRouter(services: AppServices): Router {
  const router = Router()

  router.get('/subscriptions', async (req, res) => {
    const rows = await services.libraryService.listSubscriptions(req.userId)
    res.json(rows.map(toLibrarySubscriptionDto))
  })

  router.post('/subscriptions', async (req, res) => {
    const parsed = librarySubscriptionCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message })
      return
    }

    try {
      const row = await services.libraryService.subscribe(req.userId, parsed.data.folderPath)
      res.status(201).json(toLibrarySubscriptionDto(row))
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

  return router
}
