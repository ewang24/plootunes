import express from 'express'
import cors from 'cors'
import session from 'express-session'
import * as oidcClient from 'openid-client'
import { sql } from 'drizzle-orm'
import { db } from './db/index.ts'
import { createDaos } from './daoFactory.ts'
import { createServices } from './serviceFactory.ts'
import { createAdapters } from './adapterFactory.ts'
import { createAuthRouter } from './routes/auth.ts'
import { createSongsRouter } from './routes/songs.ts'
import { createAlbumsRouter } from './routes/albums.ts'
import { createArtistsRouter } from './routes/artists.ts'
import { createQueueRouter } from './routes/queue.ts'
import { createPlaybackRouter } from './routes/playback.ts'
import { createLibraryRouter } from './routes/library.ts'
import { createStatsRouter } from './routes/stats.ts'
import { createWidgetRouter } from './routes/widgets.ts'
import { createPreferencesRouter } from './routes/preferences.ts'
import { createAudioRouter } from './routes/audio.ts'
import { EnvCoverStorageConfigProvider } from './services/coverStorageService.ts'

const app = express()
const port = process.env.PORT ?? 3000

// Behind Caddy (TLS) -> client nginx -> server. Trust the proxy chain so Express
// reads X-Forwarded-Proto and treats the request as HTTPS. Without this, the
// `secure: true` session cookie is silently dropped in prod and login loops forever.
app.set('trust proxy', true)

const authBypass = process.env.PLOOTUNES_AUTH_BYPASS === 'true'
if (authBypass && process.env.NODE_ENV === 'production') {
  throw new Error('PLOOTUNES_AUTH_BYPASS must never be enabled in production')
}
if (authBypass) {
  console.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  console.warn('!! PLOOTUNES_AUTH_BYPASS is ENABLED — ALL REQUESTS ARE AUTHENTICATED')
  console.warn(
    `!! Bypass user: ${process.env.PLOOTUNES_E2E_USER_ID ?? '00000000-0000-0000-0000-000000000001'}`,
  )
  console.warn('!! DO NOT USE IN PRODUCTION')
  console.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
}

const daos = createDaos()
const services = createServices(daos)
const adapters = createAdapters(services)

// Discover OIDC configuration
const oidcIssuer = process.env.OIDC_ISSUER
const oidcClientId = process.env.OIDC_CLIENT_ID
const oidcClientSecret = process.env.OIDC_CLIENT_SECRET
const oidcDiscoveryUrl = process.env.OIDC_DISCOVERY_URL

let oidcConfig: oidcClient.Configuration | null = null
if (oidcIssuer && oidcClientId && oidcClientSecret) {
  // Authentik's per-app discovery URL returns a global issuer, so we redirect the
  // discovery fetch to the per-app URL while validating against the actual issuer.
  const discoveryOptions = oidcDiscoveryUrl
    ? {
        [oidcClient.customFetch]: (url: string | URL, init?: RequestInit) => {
          if (url.toString().includes('.well-known/openid-configuration')) {
            return fetch(oidcDiscoveryUrl, init)
          }
          return fetch(url, init)
        },
      }
    : undefined
  oidcConfig = await oidcClient.discovery(
    new URL(oidcIssuer),
    oidcClientId,
    oidcClientSecret,
    undefined,
    discoveryOptions,
  )
}

app.use(cors())
app.use(express.json())

const coverConfig = new EnvCoverStorageConfigProvider().getConfig()
app.use(coverConfig.publicBasePath, express.static(coverConfig.coversDir, { maxAge: '1y', immutable: true }))

// saveUninitialized: false means the cookie is only sent once something is written to req.session
// (so this block doesn't fire until the session is modified). The OIDC exchange route
// (/api/auth/exchange) is the only place that writes to the session (req.session.userId),
// so the cookie is implicitly gated behind a successful OIDC login.
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'changeme',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
    },
  }),
)

// Auth routes must be registered before the auth-gate middleware
if (oidcConfig) {
  app.use(
    '/api/auth',
    createAuthRouter(oidcConfig, daos.usersDao, async (userId) => {
      await daos.userPreferencesDao.ensureDefault(userId)
    }),
  )
}

app.get('/api/health', async (_req, res) => {
  try {
    await db.execute(sql`select 1`)
    res.json({ status: 'ok', db: 'up', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down', timestamp: new Date().toISOString() })
  }
})

app.use((req, res, next) => {
  if (authBypass) {
    req.userId = process.env.PLOOTUNES_E2E_USER_ID ?? '00000000-0000-0000-0000-000000000001'
    req.isAdmin = true
    next()
    return
  }

  const userId = req.session?.userId
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  req.userId = userId
  // Stub — the Emperor is sole admin during migration; no DB column yet.
  req.isAdmin = true
  next()
})

app.use('/api/songs', createSongsRouter(adapters))
app.use('/api/albums', createAlbumsRouter(adapters))
app.use('/api/artists', createArtistsRouter(adapters))
app.use('/api/queue', createQueueRouter(adapters, services))
app.use('/api/playback', createPlaybackRouter(adapters))
app.use('/api/library', createLibraryRouter(adapters, services))
app.use('/api/stats', createStatsRouter(services))
app.use('/api/widgets', createWidgetRouter(adapters, services))
app.use('/api/preferences', createPreferencesRouter(adapters))
app.use('/api/audio', createAudioRouter(services))

app.listen(port, () => {
  console.log(`PlooTunes server listening on port ${port}`)
})
