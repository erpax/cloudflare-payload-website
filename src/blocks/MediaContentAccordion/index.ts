import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import link from '../../fields/link'

export const MediaContentAccordion: Block = {
  slug: 'mediaContentAccordion',
  fields: [
    blockFields({
      name: 'mediaContentAccordionFields',
      fields: [
        {
          name: 'alignment',
          type: 'select',
          admin: {
            description: ({ t }) => t('website:blocks:MediaContentAccordion:alignment:description'),
          },
          defaultValue: 'contentMedia',
          options: [
            {
              label: ({ t }) => t('website:blocks:MediaContentAccordion:alignment:label'),
              value: 'contentMedia',
            },
            {
              label: ({ t }) => t('website:blocks:MediaContentAccordion:line25:label'),
              value: 'mediaContent',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'leader',
              type: 'text',
              admin: {
                width: '50%',
              },
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
        {
          name: 'accordion',
          type: 'array',
          // [cloudflare/d1] 63-char limit; Drizzle auto-name overflows.
          dbName: 'mca_items',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'position',
                  type: 'select',
                  admin: {
                    description: ({ t }) => t('website:blocks:MediaContentAccordion:position:description'),
                    width: '50%',
                  },
                  defaultValue: 'normal',
                  options: [
                    {
                      label: ({ t }) => t('website:blocks:MediaContentAccordion:position:label'),
                      value: 'normal',
                    },
                    {
                      label: ({ t }) => t('website:blocks:MediaContentAccordion:line72:label'),
                      value: 'inset',
                    },
                    {
                      label: ({ t }) => t('website:blocks:MediaContentAccordion:line76:label'),
                      value: 'wide',
                    },
                  ],
                },
                {
                  name: 'background',
                  type: 'select',
                  admin: {
                    description: ({ t }) => t('website:blocks:MediaContentAccordion:background:description'),
                    width: '50%',
                  },
                  defaultValue: 'none',
                  options: [
                    {
                      label: ({ t }) => t('website:blocks:MediaContentAccordion:background:label'),
                      value: 'none',
                    },
                    {
                      label: ({ t }) => t('website:blocks:MediaContentAccordion:line95:label'),
                      value: 'gradient',
                    },
                    {
                      label: ({ t }) => t('website:blocks:MediaContentAccordion:line99:label'),
                      value: 'scanlines',
                    },
                  ],
                },
              ],
            },
            {
              name: 'mediaLabel',
              type: 'text',
              required: true,
            },
            {
              name: 'mediaDescription',
              type: 'richText',
              required: true,
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
              name: 'media',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
          maxRows: 4,
          minRows: 1,
        },
      ],
    }),
  ],
}
