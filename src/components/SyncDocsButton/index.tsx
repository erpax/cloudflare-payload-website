'use client'

import { toast, useConfig, useTranslation } from '@payloadcms/ui'
import type {
  CustomTranslationsKeys,
  CustomTranslationsObject,
} from '@root/i18n/types'
import React, { useState } from 'react'

import './index.scss'

const baseClass = 'sync-docs-button'

const SyncDocsButton: React.FC = () => {
  const { t } = useTranslation<CustomTranslationsObject, CustomTranslationsKeys>()
  const [isSyncing, setIsSyncing] = useState(false)
  const {
    config: {
      routes: { api },
    },
  } = useConfig()

  const syncDocs = async () => {
    setIsSyncing(true)
    const res = await fetch(`${api}/sync/docs`)
    if (res.ok) {
      toast.success(t('website:components:SyncDocsButton:success'))
      setIsSyncing(false)
    } else {
      const data = await res.json()
      toast.error(`${t('website:components:SyncDocsButton:failure')}: ${data.message}`)
      setIsSyncing(false)
    }
  }

  return (
    <button className={baseClass} disabled={isSyncing} onClick={syncDocs}>
      {isSyncing
        ? t('website:components:SyncDocsButton:loading')
        : t('website:components:SyncDocsButton:label')}
    </button>
  )
}

export default SyncDocsButton
