'use client'

import { toast, useConfig, useTranslation } from '@payloadcms/ui'
import type {
  CustomTranslationsKeys,
  CustomTranslationsObject,
} from '@root/i18n/types'
import React, { useState } from 'react'

import './index.scss'

const baseClass = 'refresh-docs-button'

const RefreshMdxToLexicalButton: React.FC = () => {
  const { t } = useTranslation<CustomTranslationsObject, CustomTranslationsKeys>()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const {
    config: {
      routes: { api },
    },
  } = useConfig()

  const refreshDocs = async () => {
    setIsRefreshing(true)
    const res = await fetch(`${api}/refresh/mdx-to-lexical`)
    if (res.ok) {
      toast.success(t('website:components:RefreshMdxToLexicalButton:success'))
      setIsRefreshing(false)
    } else {
      const data = await res.json()
      toast.error(
        `${t('website:components:RefreshMdxToLexicalButton:failure')}: ${data.message}`,
      )
      setIsRefreshing(false)
    }
  }

  return (
    <button className={baseClass} disabled={isRefreshing} onClick={refreshDocs} type="button">
      {isRefreshing
        ? t('website:components:RefreshMdxToLexicalButton:loading')
        : t('website:components:RefreshMdxToLexicalButton:label')}
    </button>
  )
}

export default RefreshMdxToLexicalButton
