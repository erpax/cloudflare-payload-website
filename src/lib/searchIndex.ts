/**
 * Thin client over the `search` collection contributed by
 * `@payloadcms/plugin-search`. Everything ultimately lands in D1 via
 * Payload's Drizzle adapter — no raw SQL or FTS bookkeeping here.
 *
 * Reads go through the Payload local API (server-only). The HTTP-facing
 * `/api/search` route translates query-string params into the `where`
 * clauses below.
 */

import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

export type IndexedPlatform = 'discord' | 'github' | 'docs' | 'posts'

export type SearchHit = {
  objectID: string
  platform: IndexedPlatform
  slug: string
  title: string
  excerpt: string
  author: string
  helpful: boolean
  upvotes: number
  messageCount: number
  createdAt: string
  payload: unknown
  score: number
}

export type SearchQuery = {
  q: string
  platform?: IndexedPlatform | IndexedPlatform[]
  helpfulOnly?: boolean
  page?: number
  perPage?: number
}

export type SearchResult = {
  hits: SearchHit[]
  page: number
  perPage: number
  total: number
  totalPages: number
}

const buildWhere = (query: SearchQuery): Where => {
  const and: Where[] = []

  if (query.q && query.q.trim()) {
    and.push({
      or: [
        { title: { like: query.q } },
        { excerpt: { like: query.q } },
        { author: { like: query.q } },
      ],
    })
  }

  if (query.helpfulOnly) {
    and.push({ helpful: { equals: true } })
  }

  if (query.platform) {
    const list = Array.isArray(query.platform) ? query.platform : [query.platform]
    and.push({ platform: { in: list } })
  }

  return and.length === 0 ? {} : { and }
}

export const searchIndex = async (query: SearchQuery): Promise<SearchResult> => {
  const perPage = Math.min(Math.max(query.perPage ?? 20, 1), 100)
  const page = Math.max(query.page ?? 0, 0)

  const payload = await getPayload({ config: configPromise })

  // `search` is the collection slug contributed by @payloadcms/plugin-search.
  // Until `pnpm generate:types` is re-run after adding the plugin, the
  // generated `payload-types.ts` won't list `search` in the slug union, so
  // we cast through `any` here. Once types are regenerated the cast can be
  // dropped.
  const result = await (payload as any).find({
    collection: 'search',
    where: buildWhere(query),
    limit: perPage,
    page: page + 1, // Payload pages are 1-indexed; our API stays 0-indexed.
    sort: '-priority,-createdAt',
    depth: 1,
  })

  const hits: SearchHit[] = (result.docs ?? []).map((row: any) => ({
    objectID: String(row.id),
    platform: (row.platform as IndexedPlatform) ?? 'docs',
    slug: row.slug ?? row.doc?.value?.slug ?? '',
    title: row.title ?? '',
    excerpt: row.excerpt ?? '',
    author: row.author ?? '',
    helpful: row.helpful !== false,
    upvotes: row.upvotes ?? 0,
    messageCount: row.messageCount ?? 0,
    createdAt: row.createdAt ?? '',
    payload: row.doc?.value ?? null,
    score: row.priority ?? 0,
  }))

  return {
    hits,
    page,
    perPage,
    total: result.totalDocs ?? hits.length,
    totalPages: result.totalPages ?? 0,
  }
}

/**
 * Compatibility shim — the old code called `setHelpful` to flip Algolia's
 * helpful flag. Plugin-search re-syncs from the source collection's
 * beforeChange hook, so toggling `helpful` on the community-help row
 * propagates automatically. This wrapper is intentionally a no-op kept so
 * legacy imports don't break.
 */
export const setHelpful = async (_id: string, _helpful: boolean): Promise<void> => {
  // no-op — plugin-search handles propagation via collection hooks
}
