/**
 * [cloudflare] Custom next/image loader → Cloudflare Image Resizing.
 *
 * Rewrites every next/image src to `/cdn-cgi/image/<options>/<src>`, which
 * Cloudflare's edge intercepts and transforms with no Node-side `sharp`.
 *
 * Requirements (one of):
 *   - Cloudflare Image Resizing enabled on the zone (Pro+ plan); transforms
 *     are billed per resize.
 *   - Cloudflare Images on the account.
 *
 * Falls back to passthrough on localhost so `next dev` works without the
 * Cloudflare network in front of it.
 *
 * See: https://developers.cloudflare.com/images/image-resizing/url-format/
 */

import type { ImageLoaderProps } from 'next/image'

const PASSTHROUGH_HOSTS = new Set(['localhost', '127.0.0.1', 'local.payloadcms.com'])

export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps): string {
  // In dev (no Cloudflare in front of the server), don't rewrite — just hand
  // the URL back so `next dev`'s built-in image handling renders normally.
  if (typeof window !== 'undefined' && PASSTHROUGH_HOSTS.has(window.location.hostname)) {
    return src
  }

  const params = [`width=${width}`, `quality=${quality || 75}`, 'format=auto']
  // Absolute URL — Cloudflare's resizer needs the full origin for external
  // sources; relative URLs are routed through the same zone automatically.
  return `/cdn-cgi/image/${params.join(',')}/${src}`
}
