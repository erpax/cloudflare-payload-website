import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import link from '../../fields/link'
import richText from '../../fields/richText'

export const HoverHighlights: Block = {
  slug: 'hoverHighlights',
  fields: [
    blockFields({
      name: 'hoverHighlightsFields',
      fields: [
        {
          name: 'beforeHighlights',
          type: 'textarea',
        },
        {
          name: 'highlights',
          type: 'array',
          // [cloudflare/d1] 63-char limit; Drizzle auto-name overflows.
          dbName: 'hh_items',
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
            {
              name: 'media',
              type: 'group',
              admin: {
                hideGutter: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'top',
                      type: 'upload',
                      admin: {
                        width: '50%',
                      },
                      relationTo: 'media',
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'bottom',
                      type: 'upload',
                      admin: {
                        width: '50%',
                      },
                      relationTo: 'media',
                    },
                  ],
                },
              ],
              label: ({ t }) => t('website:blocks:HoverHighlights:bottom:label'),
            },
            link({
              appearances: false,
              disableLabel: true,
            }),
          ],
        },
        {
          name: 'afterHighlights',
          type: 'textarea',
        },
        link({
          appearances: false,
        }),
      ],
    }),
  ],
  labels: {
    plural: ({ t }) => t('website:blocks:HoverHighlights:hoverHighlights:plural'),
    singular: ({ t }) => t('website:blocks:HoverHighlights:hoverHighlights:singular'),
  },
}
