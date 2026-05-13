'use client'

/**
 * Search context for the community-help archive — D1 FTS5 backed.
 *
 * File name kept as `AlgoliaProvider` to minimise churn in the page tree;
 * the export is `AlgoliaProvider` so existing imports keep working. The
 * implementation no longer talks to Algolia.
 */

import * as React from 'react'

import { getInitialState } from './getInitialState'

export const algoliaPerPage = 20

type Hit = {
  objectID: string
  title: string
  body: string
  slug: string
  platform: 'discord' | 'github' | 'docs' | 'posts'
  author: string
  messageCount: number
  upvotes: number
  helpful: boolean
  createdAt: string
}

type SearchState = {
  query: string
  page: number
  totalPages: number
  hits: Hit[]
  loading: boolean
}

type SearchActions = {
  setQuery: (q: string) => void
  setPage: (p: number) => void
}

const SearchContext = React.createContext<SearchState & SearchActions>({
  query: '',
  page: 0,
  totalPages: 0,
  hits: [],
  loading: false,
  setQuery: () => undefined,
  setPage: () => undefined,
})

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

const initialURLState = (): { query: string; page: number } => {
  const initial = getInitialState() as Record<string, unknown>
  return {
    query: typeof initial.query === 'string' ? initial.query : '',
    page:
      typeof initial.page === 'string'
        ? Number.parseInt(initial.page, 10) || 0
        : typeof initial.page === 'number'
          ? initial.page
          : 0,
  }
}

export const AlgoliaProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [{ query, page }, setQP] = React.useState(() => initialURLState())
  const [hits, setHits] = React.useState<Hit[]>([])
  const [totalPages, setTotalPages] = React.useState(0)
  const [loading, setLoading] = React.useState(false)

  const debouncedQuery = useDebounce(query, 250)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({
      q: debouncedQuery,
      page: String(page),
      perPage: String(algoliaPerPage),
      platform: 'discord,github',
      helpfulOnly: '1',
    })
    fetch(`/api/site-search?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) {
          return
        }
        setHits(Array.isArray(data?.hits) ? data.hits : [])
        setTotalPages(typeof data?.totalPages === 'number' ? data.totalPages : 0)
      })
      .catch(() => {
        if (!cancelled) {
          setHits([])
          setTotalPages(0)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [debouncedQuery, page])

  const setQuery = React.useCallback((next: string) => {
    setQP((prev) => ({ query: next, page: prev.query === next ? prev.page : 0 }))
  }, [])

  const setPage = React.useCallback((next: number) => {
    setQP((prev) => ({ ...prev, page: Math.max(0, next) }))
  }, [])

  const value = React.useMemo(
    () => ({ query, page, totalPages, hits, loading, setQuery, setPage }),
    [query, page, totalPages, hits, loading, setQuery, setPage],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export const useCommunityHelpSearch = (): SearchState & SearchActions =>
  React.useContext(SearchContext)
