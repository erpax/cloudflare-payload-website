import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'

export const Banner: Block = {
  slug: 'banner',
  fields: [
    blockFields({
      name: 'bannerFields',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'type',
              type: 'select',
              admin: {
                width: '50%',
              },
              defaultValue: 'default',
              options: [
                {
                  label: ({ t }) => t('website:blocks:Banner:type:label'),
                  value: 'default',
                },
                {
                  label: ({ t }) => t('website:blocks:Banner:line27:label'),
                  value: 'success',
                },
                {
                  label: ({ t }) => t('website:blocks:Banner:line31:label'),
                  value: 'warning',
                },
                {
                  label: ({ t }) => t('website:blocks:Banner:line35:label'),
                  value: 'error',
                },
              ],
            },
            {
              name: 'addCheckmark',
              type: 'checkbox',
              admin: {
                style: {
                  alignSelf: 'center',
                },
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
      ],
    }),
  ],
}
