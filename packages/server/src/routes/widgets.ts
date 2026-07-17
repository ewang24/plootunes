import { Router } from 'express'
import { z } from 'zod'
import type { AppAdapters } from '../adapterFactory.ts'
import type { AppServices } from '../serviceFactory.ts'
import { widgetCreateSchema } from '@ploot/plootunes-shared'

export function createWidgetRouter(adapters: AppAdapters, services: AppServices): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    res.json(await adapters.widgetAdapter.listWidgets(req.userId))
  })

  router.post('/', async (req, res) => {
    const parsed = widgetCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message })
      return
    }

    res.status(201).json(await adapters.widgetAdapter.addWidget(req.userId, parsed.data.widgetType))
  })

  router.delete('/:id', async (req, res) => {
    const parsedId = z.string().uuid().safeParse(req.params.id)
    if (!parsedId.success) {
      res.sendStatus(404)
      return
    }

    const ok = await services.widgetService.removeWidget(req.userId, parsedId.data)
    res.sendStatus(ok ? 204 : 404)
  })

  return router
}
