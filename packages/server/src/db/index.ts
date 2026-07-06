import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.ts'

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://plootunes:plootunes@localhost:5432/plootunes'

const client = postgres(connectionString)
export const db = drizzle(client, { schema })

export type Database = typeof db
