import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import codeBlips from '../../fields/codeBlips'
import linkGroup from '../../fields/linkGroup'
import richText from '../../fields/richText'

export const CodeFeature: Block = {
  slug: 'codeFeature',
  fields: [
    blockFields({
      name: 'codeFeatureFields',
      fields: [
        {
          name: 'forceDarkBackground',
          type: 'checkbox',
          admin: {
            description: ({ t }) => t('website:blocks:CodeFeature:forceDarkBackground:description'),
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'alignment',
              type: 'select',
              admin: {
                description: ({ t }) => t('website:blocks:CodeFeature:alignment:description'),
                width: '50%',
              },
              defaultValue: 'contentCode',
              options: [
                {
                  label: ({ t }) => t('website:blocks:CodeFeature:alignment:label'),
                  value: 'contentCode',
                },
                {
                  label: ({ t }) => t('website:blocks:CodeFeature:line38:label'),
                  value: 'codeContent',
                },
              ],
            },
            {
              name: 'heading',
              type: 'text',
              admin: {
                width: '50%',
              },
            },
          ],
        },
        richText(),
        linkGroup({
          appearances: false,
        }),
        {
          name: 'codeTabs',
          type: 'array',
          // [cloudflare/d1] 63-char limit; overflows under reusable_content.
          // Must NOT start with `cf` — workerd reserves the `_cf_` prefix
          // (Payload prepends `_` for version tables, so `cf_*` → `_cf_*`).
          dbName: 'ctabs',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'language',
                  type: 'select',
                  defaultValue: 'none',
                  options: [
                    {
                      label: ({ t }) => t('website:blocks:CodeFeature:language:label'),
                      value: 'none',
                    },
                    {
                      label: ({ t }) => t('website:blocks:CodeFeature:language:label'),
                      value: 'js',
                    },
                    {
                      label: ({ t }) => t('website:blocks:CodeFeature:line79:label'),
                      value: 'ts',
                    },
                  ],
                },
                {
                  name: 'label',
                  type: 'text',
                  label: ({ t }) => t('website:blocks:CodeFeature:label:label'),
                  required: true,
                },
              ],
            },
            {
              name: 'code',
              type: 'code',
              required: true,
            },
            codeBlips,
          ],
          minRows: 1,
        },
      ],
    }),
  ],
}
