const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set('X-Timezone', TIMEZONE)
  const res = await fetch(input, { ...init, headers })
  if (res.status === 401) {
    window.location.href = '/api/auth/login'
  }
  return res
}
