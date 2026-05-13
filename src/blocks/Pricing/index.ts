import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import link from '../../fields/link'

export const Pricing: Block = {
  slug: 'pricing',
  fields: [
    blockFields({
      name: 'pricingFields',
      fields: [
        {
          name: 'plans',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'hasPrice',
              type: 'checkbox',
            },
            {
              name: 'enableCreatePayload',
              type: 'checkbox',
            },
            {
              name: 'price',
              type: 'text',
              admin: {
                condition: (_, { hasPrice }) => Boolean(hasPrice),
              },
              label: ({ t }) => t('website:blocks:Pricing:price:label'),
              required: true,
            },
            {
              name: 'title',
              type: 'text',
              admin: {
                condition: (_, { hasPrice }) => !hasPrice,
              },
              label: ({ t }) => t('website:blocks:Pricing:title:label'),
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
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
              name: 'features',
              type: 'array',
              fields: [
                {
                  name: 'icon',
                  type: 'radio',
                  options: [
                    {
                      label: ({ t }) => t('website:blocks:Pricing:icon:label'),
                      value: 'check',
                    },
                    {
                      label: ({ t }) => t('website:blocks:Pricing:icon:label'),
                      value: 'x',
                    },
                  ],
                },
                {
                  name: 'feature',
                  type: 'text',
                  label: false,
                },
              ],
            },
          ],
          maxRows: 4,
          minRows: 1,
        },
        {
          name: 'disclaimer',
          type: 'text',
        },
      ],
    }),
  ],
}
