import { Router } from 'express'
import type { AppAdapters } from '../adapterFactory.ts'
import { preferencesUpdateSchema } from '@ploot/plootunes-shared'

export function createPreferencesRouter(adapters: AppAdapters): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    res.json(await adapters.preferencesAdapter.getPreferences(req.userId))
  })

  router.put('/', async (req, res) => {
    const parsed = preferencesUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message })
      return
    }

    res.json(await adapters.preferencesAdapter.updatePreferences(req.userId, parsed.data))
  })

  return router
}
