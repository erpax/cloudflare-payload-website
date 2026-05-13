import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import richText from '../../fields/richText'

export const Content: Block = {
  slug: 'content',
  fields: [
    blockFields({
      name: 'contentFields',
      fields: [
        {
          name: 'useLeadingHeader',
          type: 'checkbox',
          label: ({ t }) => t('website:blocks:Content:useLeadingHeader:label'),
        },
        richText({
          name: 'leadingHeader',
          admin: {
            condition: (_, siblingData) => siblingData.useLeadingHeader,
          },
          label: ({ t }) => t('website:blocks:Content:leadingHeader:label'),
        }),
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'oneColumn',
          options: [
            {
              label: ({ t }) => t('website:blocks:Content:layout:label'),
              value: 'oneColumn',
            },
            {
              label: ({ t }) => t('website:blocks:Content:layout:label'),
              value: 'twoColumns',
            },
            {
              label: ({ t }) => t('website:blocks:Content:line38:label'),
              value: 'twoThirdsOneThird',
            },
            {
              label: ({ t }) => t('website:blocks:Content:line42:label'),
              value: 'halfAndHalf',
            },
            {
              label: ({ t }) => t('website:blocks:Content:line46:label'),
              value: 'threeColumns',
            },
          ],
        },
        richText({
          name: 'columnOne',
        }),
        richText({
          name: 'columnTwo',
          admin: {
            condition: (_, siblingData) =>
              ['halfAndHalf', 'threeColumns', 'twoColumns', 'twoThirdsOneThird'].includes(
                siblingData.layout,
              ),
          },
        }),
        richText({
          name: 'columnThree',
          admin: {
            condition: (_, siblingData) => siblingData.layout === 'threeColumns',
          },
        }),
      ],
    }),
  ],
}
