'use client'

/**
 * Cloudflare Turnstile widget — replaces react-google-recaptcha.
 *
 * Loads https://challenges.cloudflare.com/turnstile/v0/api.js once per page
 * and renders an explicit widget into a div ref. Exposes an imperative
 * `getValue()` / `reset()` API that matches the parts of the
 * react-google-recaptcha surface that CMSForm depended on.
 */

import * as React from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        opts: {
          sitekey: string
          theme?: 'auto' | 'dark' | 'light'
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
        },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
      getResponse: (widgetId?: string) => string | undefined
    }
    __turnstileOnLoadResolvers?: Array<() => void>
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__onTurnstileLoad&render=explicit'

const ensureScriptLoaded = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }
  if (window.turnstile) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    window.__turnstileOnLoadResolvers = window.__turnstileOnLoadResolvers ?? []
    window.__turnstileOnLoadResolvers.push(resolve)

    if (document.getElementById('cf-turnstile-script')) {
      return
    }

    // Global onload hook shared across multiple Turnstile instances.
    ;(window as unknown as { __onTurnstileLoad: () => void }).__onTurnstileLoad = () => {
      ;(window.__turnstileOnLoadResolvers ?? []).forEach((fn) => fn())
      window.__turnstileOnLoadResolvers = []
    }

    const s = document.createElement('script')
    s.id = 'cf-turnstile-script'
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    document.head.appendChild(s)
  })
}

export type TurnstileHandle = {
  getValue: () => string | undefined
  reset: () => void
}

export type TurnstileProps = {
  sitekey: string
  theme?: 'auto' | 'dark' | 'light'
  className?: string
  onVerify?: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

export const Turnstile = React.forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile(
  { sitekey, theme = 'auto', className, onVerify, onExpire, onError },
  ref,
) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const widgetIdRef = React.useRef<string | null>(null)
  const tokenRef = React.useRef<string | undefined>(undefined)

  React.useImperativeHandle(
    ref,
    () => ({
      getValue: () => tokenRef.current,
      reset: () => {
        tokenRef.current = undefined
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current)
        }
      },
    }),
    [],
  )

  React.useEffect(() => {
    let cancelled = false
    if (!sitekey || !containerRef.current) {
      return
    }

    void ensureScriptLoaded().then(() => {
      if (cancelled || !window.turnstile || !containerRef.current) {
        return
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey,
        theme,
        callback: (token) => {
          tokenRef.current = token
          onVerify?.(token)
        },
        'expired-callback': () => {
          tokenRef.current = undefined
          onExpire?.()
        },
        'error-callback': () => {
          tokenRef.current = undefined
          onError?.()
        },
      })
    })

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [sitekey, theme, onVerify, onExpire, onError])

  return <div ref={containerRef} className={className} />
})
