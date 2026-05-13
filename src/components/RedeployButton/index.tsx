'use client'

import { useConfig, useTranslation } from '@payloadcms/ui'
import type {
  CustomTranslationsKeys,
  CustomTranslationsObject,
} from '@root/i18n/types'
import React, { useState } from 'react'
import { toast } from 'sonner'

import './index.scss'

const baseClass = 'redeploy-button'

const RedeployButton: React.FC = () => {
  const { t } = useTranslation<CustomTranslationsObject, CustomTranslationsKeys>()
  const [isLoading, setIsLoading] = useState(false)
  const {
    config: {
      routes: { api },
    },
  } = useConfig()

  const redeployCMS = async () => {
    setIsLoading(true)
    const res = await fetch(`${api}/redeploy/website`, {
      method: 'POST',
    })
    if (res.ok) {
      toast.success(t('website:components:RedeployButton:success'), { duration: 3000 })
      setIsLoading(false)
    } else {
      const data = await res.json()
      toast.error(data.message, { duration: 3000 })
      setIsLoading(false)
    }
  }

  return (
    <button className={baseClass} disabled={isLoading} onClick={redeployCMS} type="button">
      {isLoading
        ? t('website:components:RedeployButton:loading')
        : t('website:components:RedeployButton:label')}
    </button>
  )
}

export default RedeployButton
