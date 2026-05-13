'use client'

/**
 * Cloudflare Web Analytics beacon — replaces Google Analytics + Google Tag
 * Manager + Facebook Pixel. The beacon is a single <script> from
 * static.cloudflareinsights.com that records page views, navigation timings,
 * and Web Vitals server-side; no cookies, no client SDK.
 *
 * Setup:
 *   1. Cloudflare dashboard > Web Analytics > add a site (or use the zone
 *      automatic option). Copy the beacon "token".
 *   2. Set NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN in wrangler.jsonc vars.
 *
 * Docs: https://developers.cloudflare.com/web-analytics/
 */

import { usePrivacy } from '@root/providers/Privacy/index'
import Script from 'next/script'
import * as React from 'react'

const token = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN

export const CloudflareWebAnalytics: React.FC = () => {
  const { cookieConsent } = usePrivacy()

  if (!token || !cookieConsent) {
    return null
  }

  return (
    <Script
      defer
      id="cf-web-analytics"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  )
}
