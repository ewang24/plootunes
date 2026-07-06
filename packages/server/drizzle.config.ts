import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './dbUpdates',
  dialect: 'postgresql',
  migrations: {
    prefix: 'timestamp',
  },
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://plootunes:plootunes@localhost:5432/plootunes',
  },
})
