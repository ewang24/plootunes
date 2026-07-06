import express from 'express'
import cors from 'cors'
import { sql } from 'drizzle-orm'
import { db } from './db/index.ts'

const app = express()
const port = process.env.PORT ?? 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    await db.execute(sql`select 1`)
    res.json({ status: 'ok', db: 'up', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down', timestamp: new Date().toISOString() })
  }
})

app.listen(port, () => {
  console.log(`PlooTunes server listening on port ${port}`)
})
