'use client'

import { toast, useConfig, useTranslation } from '@payloadcms/ui'
import type {
  CustomTranslationsKeys,
  CustomTranslationsObject,
} from '@root/i18n/types'
import React, { useState } from 'react'

import './index.scss'

const baseClass = 'sync-ch-button'

const SyncCommunityHelp: React.FC = () => {
  const { t } = useTranslation<CustomTranslationsObject, CustomTranslationsKeys>()
  const [isSyncing, setIsSyncing] = useState(false)
  const {
    config: {
      routes: { api },
    },
  } = useConfig()

  const syncCommunityHelp = async () => {
    try {
      setIsSyncing(true)

      const res = await fetch(`${api}/sync-ch`)

      if (!res.ok) {
        let errorMessage = t('website:components:SyncCommunityHelp:failure')
        try {
          const data = await res.json()
          errorMessage += `: ${data?.message || 'Unknown error'}`
        } catch (error) {
          errorMessage += ': Unable to parse error response.'
        }
        toast.error(errorMessage)
        return
      }

      toast.success(t('website:components:SyncCommunityHelp:success'))
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error(t('website:components:SyncCommunityHelp:errorRetry'))
    }
    setIsSyncing(false)
  }

  return (
    <button className={baseClass} disabled={isSyncing} onClick={syncCommunityHelp} type="button">
      {isSyncing
        ? t('website:components:SyncCommunityHelp:loading')
        : t('website:components:SyncCommunityHelp:label')}
    </button>
  )
}

export default SyncCommunityHelp
