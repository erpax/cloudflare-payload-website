'use client'

/**
 * Search input bound to the D1 FTS context (`AlgoliaProvider`). File name
 * kept for migration compatibility.
 */

import { useCommunityHelpSearch } from '@root/app/(frontend)/(pages)/community-help/AlgoliaProvider/index'
import useDebounce from '@root/utilities/use-debounce'
import * as React from 'react'

import classes from './index.module.scss'

const minValueLength = 3

export const AlgoliaSearchBox: React.FC<{
  className?: string
}> = (props) => {
  const { className } = props
  const { query, setQuery } = useCommunityHelpSearch()

  const [value, setValue] = React.useState(query)
  const debouncedInput = useDebounce(value, 700)

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
    },
    [],
  )

  React.useEffect(() => {
    if (debouncedInput.length >= minValueLength) {
      setQuery(debouncedInput)
    } else if (debouncedInput.length === 0) {
      setQuery('')
    }
  }, [debouncedInput, setQuery])

  return (
    <input
      {...props}
      className={[classes.algoliaSearchBox, className].filter(Boolean).join(' ')}
      onChange={handleChange}
      type="text"
      value={value}
    />
  )
}
