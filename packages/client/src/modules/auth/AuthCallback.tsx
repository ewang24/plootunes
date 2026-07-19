import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    if (!code || !state) return

    // Use raw fetch (not apiFetch) so a failed exchange can't trigger a login redirect.
    fetch('/api/auth/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    }).then((res) => {
      if (res.ok) {
        navigate('/')
      }
    })
  }, [])

  return <div>Signing in...</div>
}
