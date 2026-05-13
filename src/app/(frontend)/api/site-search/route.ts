/**
 * Public search wrapper around the plugin-search `search` collection on D1.
 *
 *   GET /api/site-search?q=...&platform=discord,github&helpfulOnly=1&page=0&perPage=20
 *
 * `platform` accepts a comma-separated list. `helpfulOnly` is truthy when
 * the param is present and not "0"/"false". The endpoint is renamed from
 * `/api/search` so it doesn't shadow Payload's auto-mounted REST endpoint
 * for the `search` collection. Direct REST callers can still use
 * `/api/search?where[...]=...` with Payload's standard query syntax.
 */

import { searchIndex, type IndexedPlatform } from '@root/lib/searchIndex'
import { NextResponse } from 'next/server'

const ALLOWED: ReadonlySet<IndexedPlatform> = new Set(['discord', 'github', 'docs', 'posts'])

const parsePlatform = (raw: string | null): IndexedPlatform[] | undefined => {
  if (!raw) {
    return undefined
  }
  const parts = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is IndexedPlatform => ALLOWED.has(s as IndexedPlatform))
  return parts.length > 0 ? parts : undefined
}

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').trim()
  const platform = parsePlatform(url.searchParams.get('platform'))
  const helpfulRaw = url.searchParams.get('helpfulOnly')
  const helpfulOnly = helpfulRaw !== null && helpfulRaw !== '0' && helpfulRaw !== 'false'
  const page = Number.parseInt(url.searchParams.get('page') ?? '0', 10) || 0
  const perPage = Number.parseInt(url.searchParams.get('perPage') ?? '20', 10) || 20

  try {
    const result = await searchIndex({ q, platform, helpfulOnly, page, perPage })
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (err) {
    console.error('[/api/site-search] error', err)
    return NextResponse.json(
      { error: 'search-failed', hits: [], total: 0, totalPages: 0, page, perPage },
      { status: 500 },
    )
  }
}
