import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import link from '../../fields/link'
import richText from '../../fields/richText'

export const MediaContent: Block = {
  slug: 'mediaContent',
  fields: [
    blockFields({
      name: 'mediaContentFields',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'alignment',
              type: 'select',
              admin: {
                description: ({ t }) => t('website:blocks:MediaContent:alignment:description'),
                width: '50%',
              },
              defaultValue: 'contentMedia',
              options: [
                {
                  label: ({ t }) => t('website:blocks:MediaContent:alignment:label'),
                  value: 'contentMedia',
                },
                {
                  label: ({ t }) => t('website:blocks:MediaContent:line30:label'),
                  value: 'mediaContent',
                },
              ],
            },
            {
              name: 'mediaWidth',
              type: 'select',
              admin: {
                description: ({ t }) => t('website:blocks:MediaContent:mediaWidth:description'),
                width: '50%',
              },
              defaultValue: 'stretch',
              options: [
                {
                  label: ({ t }) => t('website:blocks:MediaContent:mediaWidth:label'),
                  value: 'stretch',
                },
                {
                  label: ({ t }) => t('website:blocks:MediaContent:line49:label'),
                  value: 'fit',
                },
              ],
            },
          ],
        },
        richText(),
        {
          name: 'enableLink',
          type: 'checkbox',
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              condition: (_, { enableLink }) => enableLink,
            },
          },
        }),
        {
          name: 'images',
          type: 'array',
          // [cloudflare/d1] 63-char limit; auto-name overflows when this
          // block is used inside reusable_content.
          dbName: 'mc_images',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
        },
      ],
    }),
  ],
}
