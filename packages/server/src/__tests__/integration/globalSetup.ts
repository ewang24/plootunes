import { GenericContainer, type StartedTestContainer } from 'testcontainers'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import path from 'path'
import { fileURLToPath } from 'url'
import * as schema from '../../db/schema.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = path.resolve(__dirname, '../../../dbUpdates')

let container: StartedTestContainer

export async function setup({ provide }: { provide: (key: string, value: unknown) => void }) {
  console.log('[integration] Starting Postgres container...')

  container = await new GenericContainer('postgres:16-alpine')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'plootunes_test',
    })
    .withExposedPorts(5432)
    .start()

  const port = container.getMappedPort(5432)
  const url = `postgres://test:test@localhost:${port}/plootunes_test`

  console.log(`[integration] Container started on port ${port}, running migrations...`)

  const client = postgres(url, { max: 1 })
  const db = drizzle(client, { schema })
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR })
  await client.end()

  console.log('[integration] Migrations complete.')

  provide('dbUrl', url)
}

export async function teardown() {
  await container?.stop()
  console.log('[integration] Container stopped.')
}
