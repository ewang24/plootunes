import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db } from './index.ts'

await migrate(db, { migrationsFolder: './dbUpdates' })
await (db as any).$client.end()
