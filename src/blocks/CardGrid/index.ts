import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import link from '../../fields/link'
import linkGroup from '../../fields/linkGroup'
import richText from '../../fields/richText'

export const CardGrid: Block = {
  slug: 'cardGrid',
  fields: [
    blockFields({
      name: 'cardGridFields',
      fields: [
        richText(),
        linkGroup({
          appearances: false,
          overrides: {
            admin: {
              description: ({ t }) => t('website:blocks:CardGrid:cardGridFields:description'),
            },
          },
        }),
        {
          name: 'revealDescription',
          type: 'checkbox',
          label: ({ t }) => t('website:blocks:CardGrid:revealDescription:label'),
        },
        {
          name: 'cards',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
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
              disableLabel: true,
              overrides: {
                admin: {
                  condition: (_, { enableLink }) => enableLink,
                },
              },
            }),
          ],
        },
      ],
    }),
  ],
}
