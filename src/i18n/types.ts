/**
 * Shared types for our custom translation namespace, following the pattern
 * documented at https://payloadcms.com/docs/configuration/i18n.
 *
 * Use these in custom admin components via the typed `useTranslation`
 * hook from `@payloadcms/ui`:
 *
 *   import { useTranslation } from '@payloadcms/ui'
 *   import type { CustomTranslationsObject, CustomTranslationsKeys } from '@root/i18n/types'
 *
 *   const { t } = useTranslation<CustomTranslationsObject, CustomTranslationsKeys>()
 *   t('website:collections:Categories:name:label') // typed!
 *
 * Or to type an inline LabelFunction at a field config:
 *
 *   import type { LabelFunction } from 'payload'
 *   const label: LabelFunction<CustomTranslationsKeys> =
 *     ({ t }) => t('website:collections:Foo:bar:label')
 *
 * Note: there is no global module augmentation that widens Payload's
 * `DefaultTranslationKeys` because the type alias is computed from a
 * literal `typeof enTranslations` — only interfaces are augmentable.
 */

import type { NestedKeysStripped } from '@payloadcms/translations'
import { en as enBase } from '@payloadcms/translations/languages/en'

import websiteI18n from './website.json'

export const customTranslations = {
  en: {
    website: websiteI18n.en,
  },
  bg: {
    website: websiteI18n.bg,
  },
}

export type CustomTranslationsObject = typeof customTranslations.en & typeof enBase

export type CustomTranslationsKeys = NestedKeysStripped<CustomTranslationsObject>
