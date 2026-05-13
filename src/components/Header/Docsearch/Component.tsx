'use client'

/**
 * Header search widget — D1 FTS5 backed. Replaces `@docsearch/react`.
 *
 * Renders a small button that opens a search dialog. The dialog hits
 * `/api/search` with the user query and lists results.
 */

import { usePathname } from 'next/navigation'
import * as React from 'react'

import classes from './index.module.scss'

type Hit = {
  objectID: string
  title: string
  body: string
  slug: string
  platform: string
}

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

const buildUrl = (hit: Hit, path: string): string => {
  if (hit.platform === 'docs') {
    const url = `/docs/${hit.slug}`
    return path.includes('/docs/v2/') ? url.replace('/docs/', '/docs/v2/') : url
  }
  if (hit.platform === 'posts') {
    return `/blog/${hit.slug}`
  }
  return `/community-help/${hit.platform.toLowerCase()}/${hit.slug}`
}

function Component() {
  const path = usePathname() ?? ''
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const debouncedQuery = useDebounce(query, 200)
  const [hits, setHits] = React.useState<Hit[]>([])
  const [loading, setLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    if (!open) {
      return
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    inputRef.current?.focus()
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  React.useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setHits([])
      return
    }
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({ q: debouncedQuery, perPage: '8' })
    fetch(`/api/site-search?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setHits(Array.isArray(data?.hits) ? data.hits : [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHits([])
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
  }, [debouncedQuery])

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        className={classes.searchButton}
        onClick={() => setOpen(true)}
      >
        <span className={classes.searchIcon}>⌕</span>
        <span className={classes.searchLabel}>Search</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className={classes.dialog}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false)
            }
          }}
        >
          <div className={classes.dialogInner}>
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              placeholder="Search docs, blog, and community help…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={classes.dialogInput}
            />
            <div className={classes.results}>
              {loading && <p className={classes.empty}>Searching…</p>}
              {!loading && debouncedQuery.length >= 2 && hits.length === 0 && (
                <p className={classes.empty}>No results.</p>
              )}
              <ul className={classes.resultList}>
                {hits.map((hit) => (
                  <li key={hit.objectID}>
                    <a
                      className={hit.platform === 'posts' ? classes.blogResult : ''}
                      href={buildUrl(hit, path)}
                      onClick={() => setOpen(false)}
                    >
                      <span className={classes.resultTitle}>{hit.title}</span>
                      <span className={classes.resultMeta}>{hit.platform}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Component
