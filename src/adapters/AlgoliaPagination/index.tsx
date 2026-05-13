'use client'

/**
 * Pagination bound to the D1 FTS context. File name kept for migration
 * compatibility.
 */

import { useCommunityHelpSearch } from '@root/app/(frontend)/(pages)/community-help/AlgoliaProvider/index'
import { ChevronIcon } from '@root/icons/ChevronIcon/index'
import * as React from 'react'

import classes from './index.module.scss'

export const AlgoliaPagination: React.FC<{ className?: string }> = ({ className }) => {
  const { page, totalPages, setPage } = useCommunityHelpSearch()

  const pages = React.useMemo(
    () => Array.from({ length: Math.max(totalPages, 0) }, (_, i) => i),
    [totalPages],
  )

  const [indexToShow, setIndexToShow] = React.useState([0, 1, 2, 3, 4])
  const showFirstPage = totalPages > 5 && page >= 2
  const showLastPage = totalPages > 5 && page <= totalPages - 3

  React.useEffect(() => {
    if (showFirstPage && showLastPage) {
      setIndexToShow([page - 1, page, page + 1])
    } else if (showFirstPage && !showLastPage) {
      setIndexToShow([totalPages - 3, totalPages - 2, totalPages - 1])
    } else if (!showFirstPage && showLastPage) {
      setIndexToShow([0, 1, 2])
    } else {
      setIndexToShow([0, 1, 2, 3, 4])
    }
  }, [showFirstPage, showLastPage, page, totalPages])

  const goto = React.useCallback(
    (p: number) => {
      setPage(p)
      window.scrollTo({ behavior: 'smooth', top: 0 })
    },
    [setPage],
  )

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={[classes.pagination, className].filter(Boolean).join(' ')}>
      <div className={classes.pages}>
        {showFirstPage && (
          <>
            <button className={classes.paginationButton} onClick={() => goto(0)} type="button">
              1
            </button>
            <div className={classes.dash}>&mdash;</div>
          </>
        )}
        {pages.map((p, index) => {
          if (!indexToShow.includes(index)) {
            return null
          }
          const isCurrent = page === p
          return (
            <div key={index}>
              <button
                className={[
                  classes.paginationButton,
                  isCurrent && classes.paginationButtonActive,
                  isCurrent && classes.disabled,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => goto(p)}
                type="button"
              >
                {p + 1}
              </button>
            </div>
          )
        })}
        {showLastPage && (
          <>
            <div className={classes.dash}>&mdash;</div>
            <button
              className={classes.paginationButton}
              onClick={() => goto(totalPages - 1)}
              type="button"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      <button
        className={[classes.chevronButton, page === 0 && classes.disabled]
          .filter(Boolean)
          .join(' ')}
        disabled={page === 0}
        onClick={() => goto(page - 1)}
        type="button"
      >
        <ChevronIcon rotation={180} />
      </button>
      <div className={classes.nextPrev}>
        <button
          className={[classes.chevronButton, page >= totalPages - 1 && classes.disabled]
            .filter(Boolean)
            .join(' ')}
          disabled={page >= totalPages - 1}
          onClick={() => goto(page + 1)}
          type="button"
        >
          <ChevronIcon />
        </button>
      </div>
    </div>
  )
}
