'use client'

import { Button, TextInput, toast, useConfig, useTranslation } from '@payloadcms/ui'
import type {
  CustomTranslationsKeys,
  CustomTranslationsObject,
} from '@root/i18n/types'
import React, { useState } from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  const { t } = useTranslation<CustomTranslationsObject, CustomTranslationsKeys>()
  const [isLoadingLatest, setIsLoadingLatest] = useState(false)
  const [isLoadingSpecific, setIsLoadingSpecific] = useState(false)
  const [version, setVersion] = useState('')

  const {
    config: {
      routes: { api },
    },
  } = useConfig()

  const createPost = (versionOverride?: string) => {
    const isSpecific = Boolean(versionOverride)
    if (isSpecific) {
      setIsLoadingSpecific(true)
    } else {
      setIsLoadingLatest(true)
    }

    const promise = fetch(`${api}/create-release-post-from-admin`, {
      body: JSON.stringify(versionOverride ? { version: versionOverride } : {}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to create release post')
      }
    })

    void toast.promise(promise, {
      error: (err: Error) => err.message,
      loading: t('website:components:BeforeDashboard:toastLoading'),
      success: t('website:components:BeforeDashboard:toastSuccess'),
    })

    void promise.finally(() => {
      if (isSpecific) {
        setIsLoadingSpecific(false)
      } else {
        setIsLoadingLatest(false)
      }
    })
  }

  return (
    <div className={baseClass}>
      <h2 className={`${baseClass}__heading`}>
        {t('website:components:BeforeDashboard:heading')}
      </h2>
      <h4>{t('website:components:BeforeDashboard:subheading')}</h4>
      <div className={`${baseClass}__actions`}>
        <Button
          buttonStyle="secondary"
          disabled={isLoadingLatest}
          onClick={() => createPost()}
          size="large"
        >
          {isLoadingLatest
            ? t('website:components:BeforeDashboard:pullLatestLoading')
            : t('website:components:BeforeDashboard:pullLatest')}
        </Button>
        <div className={`${baseClass}__specific`}>
          <TextInput
            onChange={(e) => setVersion((e as React.ChangeEvent<HTMLInputElement>).target.value)}
            path="version"
            placeholder={t('website:components:BeforeDashboard:versionPlaceholder')}
            value={version}
          />
          <Button
            buttonStyle="secondary"
            disabled={isLoadingSpecific || !version.trim()}
            onClick={() => createPost(version.trim())}
            size="large"
          >
            {isLoadingSpecific
              ? t('website:components:BeforeDashboard:pullSpecificLoading')
              : t('website:components:BeforeDashboard:pullSpecific')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BeforeDashboard
