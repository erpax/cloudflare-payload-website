/**
 * Cloudflare Turnstile server-side verification.
 *
 * Replaces the previous Google reCAPTCHA v2 siteverify call. The public
 * site key lives in `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; the secret key lives
 * in `TURNSTILE_SECRET_KEY` (set with `wrangler secret put`).
 *
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type VerifyTurnstileArgs = {
  /** Turnstile response token from the client widget. */
  token: string
  /** Optional end-user IP for the siteverify request. */
  remoteip?: string
  /** Secret key — pass `process.env.TURNSTILE_SECRET_KEY`. */
  secret: string
}

export const verifyTurnstile = async ({
  token,
  remoteip,
  secret,
}: VerifyTurnstileArgs): Promise<boolean> => {
  if (!secret || !token) {
    return false
  }

  const body = new URLSearchParams()
  body.append('secret', secret)
  body.append('response', token)
  if (remoteip) {
    body.append('remoteip', remoteip)
  }

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body,
    })
    if (!res.ok) {
      return false
    }
    const data = (await res.json()) as { success?: boolean }
    return data?.success === true
  } catch {
    return false
  }
}
