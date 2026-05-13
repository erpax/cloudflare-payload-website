'use client'

import RedeployButton from '@components/RedeployButton'
import RefreshMdxToLexicalButton from '@components/RefreshMdxToLexicalButton'
import SyncCommunityHelp from '@components/SyncCommunityHelp'
import SyncDocsButton from '@components/SyncDocsButton'
import SyncToAlgolia from '@components/SyncToAlgolia'
import { useTranslation } from '@payloadcms/ui'
import type {
  CustomTranslationsKeys,
  CustomTranslationsObject,
} from '@root/i18n/types'
import React from 'react'

import './index.scss'

const baseClass = 'after-nav-actions'

const AfterNavActions: React.FC = () => {
  const { t } = useTranslation<CustomTranslationsObject, CustomTranslationsKeys>()
  return (
    <div className={baseClass}>
      <span className={`${baseClass}__group-title`}>
        {t('website:components:AfterNavActions:title')}
      </span>
      <SyncDocsButton />
      <RefreshMdxToLexicalButton />
      <RedeployButton />
      <SyncToAlgolia />
    </div>
  )
}

export default AfterNavActions
