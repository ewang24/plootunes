import { randomUUID } from 'crypto'
import { Router } from 'express'
import * as oidcClient from 'openid-client'
import type { IUsersDao } from '../dao/usersDao.ts'

export function createAuthRouter(
  config: oidcClient.Configuration,
  usersDao: IUsersDao,
  onUserUpserted?: (userId: string) => Promise<void>,
): Router {
  const router = Router()

  router.get('/login', (req, res) => {
    const state = randomUUID()
    req.session.oauthState = state
    const redirectUrl = oidcClient.buildAuthorizationUrl(config, {
      redirect_uri: process.env.OIDC_REDIRECT_URI!,
      scope: 'openid profile email',
      state,
    })
    res.redirect(redirectUrl.href)
  })

  router.post('/exchange', async (req, res) => {
    const { code, state } = req.body as { code?: string; state?: string }
    if (!code || !state) {
      res.status(400).json({ error: 'Missing code or state' })
      return
    }

    if (!req.session.oauthState || state !== req.session.oauthState) {
      res.status(401).json({ error: 'Invalid state' })
      return
    }

    try {
      const callbackUrl = new URL(process.env.OIDC_REDIRECT_URI!)
      callbackUrl.searchParams.set('code', code)
      callbackUrl.searchParams.set('state', state)

      const tokenSet = await oidcClient.authorizationCodeGrant(config, callbackUrl, {
        expectedState: state,
      })

      const claims = tokenSet.claims()
      const user = await usersDao.upsert({
        id: claims!.sub,
        username: String(claims!.preferred_username ?? claims!.sub),
        displayName: claims!.name ? String(claims!.name) : undefined,
      })

      if (onUserUpserted) {
        try {
          await onUserUpserted(user.id)
        } catch (err) {
          console.warn('[auth] post-login provisioning failed:', err)
        }
      }

      req.session.oauthState = undefined
      req.session.userId = user.id
      res.json({ ok: true })
    } catch (err) {
      console.error('[auth] exchange failed:', err)
      res.status(401).json({ error: 'Unauthorized' })
    }
  })

  router.post('/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true })
    })
  })

  return router
}
