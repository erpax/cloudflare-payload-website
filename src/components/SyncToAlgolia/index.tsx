'use client'

/**
 * Admin button that re-syncs Community Help threads into the D1 search
 * index. The component name is kept for migration compatibility; the API
 * route also retained its `/sync-algolia` path. Both now write to D1 FTS.
 */

import { toast, useConfig, useTranslation } from '@payloadcms/ui'
import type {
  CustomTranslationsKeys,
  CustomTranslationsObject,
} from '@root/i18n/types'
import React, { useState } from 'react'

import './index.scss'

const baseClass = 'sync-algolia-button'

const SyncToAlgolia: React.FC = () => {
  const { t } = useTranslation<CustomTranslationsObject, CustomTranslationsKeys>()
  const [isSyncing, setIsSyncing] = useState(false)
  const {
    config: {
      routes: { api },
    },
  } = useConfig()

  const syncToSearch = async () => {
    try {
      setIsSyncing(true)

      const res = await fetch(`${api}/sync-algolia`)

      if (!res.ok) {
        let errorMessage = t('website:components:SyncToAlgolia:failure')
        try {
          const data = await res.json()
          errorMessage += `: ${data?.message || 'Unknown error'}`
        } catch (error) {
          errorMessage += ': Unable to parse error response.'
        }
        toast.error(errorMessage)
        return
      }

      toast.success(t('website:components:SyncToAlgolia:success'))
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error(t('website:components:SyncToAlgolia:errorRetry'))
    }
    setIsSyncing(false)
  }

  return (
    <button className={baseClass} disabled={isSyncing} onClick={syncToSearch} type="button">
      {isSyncing
        ? t('website:components:SyncToAlgolia:loading')
        : t('website:components:SyncToAlgolia:label')}
    </button>
  )
}

export default SyncToAlgolia
