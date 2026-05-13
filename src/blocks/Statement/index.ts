import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import linkGroup from '../../fields/linkGroup'
import richText from '../../fields/richText'

export const Statement: Block = {
  slug: 'statement',
  fields: [
    blockFields({
      name: 'statementFields',
      fields: [
        richText(),
        linkGroup({
          appearances: false,
        }),
        {
          name: 'assetType',
          type: 'select',
          defaultValue: 'media',
          label: ({ t }) => t('website:blocks:Statement:assetType:label'),
          options: [
            {
              label: ({ t }) => t('website:blocks:Statement:assetType:label'),
              value: 'media',
            },
            {
              label: ({ t }) => t('website:blocks:Statement:assetType:label'),
              value: 'code',
            },
          ],
        },
        {
          name: 'media',
          type: 'upload',
          admin: {
            condition: (_, siblingData) => siblingData.assetType === 'media',
          },
          label: ({ t }) => t('website:blocks:Statement:media:label'),
          relationTo: 'media',
        },
        {
          name: 'code',
          type: 'code',
          admin: {
            condition: (_, siblingData) => siblingData.assetType === 'code',
          },
          label: ({ t }) => t('website:blocks:Statement:code:label'),
        },
        {
          type: 'row',
          fields: [
            {
              name: 'mediaWidth',
              type: 'select',
              admin: {
                condition: (_, siblingData) => siblingData.assetType === 'media',
                width: '50%',
              },
              defaultValue: 'medium',
              label: ({ t }) => t('website:blocks:Statement:mediaWidth:label'),
              options: [
                {
                  label: ({ t }) => t('website:blocks:Statement:mediaWidth:label'),
                  value: 'small',
                },
                {
                  label: ({ t }) => t('website:blocks:Statement:line68:label'),
                  value: 'medium',
                },
                {
                  label: ({ t }) => t('website:blocks:Statement:line72:label'),
                  value: 'large',
                },
                {
                  label: ({ t }) => t('website:blocks:Statement:line76:label'),
                  value: 'full',
                },
              ],
            },
            {
              name: 'backgroundGlow',
              type: 'select',
              defaultValue: 'none',
              label: ({ t }) => t('website:blocks:Statement:backgroundGlow:label'),
              options: [
                {
                  label: ({ t }) => t('website:blocks:Statement:backgroundGlow:label'),
                  value: 'none',
                },
                {
                  label: ({ t }) => t('website:blocks:Statement:backgroundGlow:label'),
                  value: 'colorful',
                },
                {
                  label: ({ t }) => t('website:blocks:Statement:line96:label'),
                  value: 'white',
                },
              ],
            },
          ],
        },
        {
          name: 'assetCaption',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData.assetType === 'media',
          },
        },
      ],
    }),
  ],
  labels: {
    plural: ({ t }) => t('website:blocks:Statement:statement:plural'),
    singular: ({ t }) => t('website:blocks:Statement:statement:singular'),
  },
}
