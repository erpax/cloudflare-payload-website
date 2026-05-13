import type { Block } from 'payload'

import { blockFields } from '@root/fields/blockFields'

export const ComparisonTable: Block = {
  slug: 'comparisonTable',
  fields: [
    blockFields({
      name: 'comparisonTableFields',
      fields: [
        {
          name: 'introContent',
          type: 'richText',
          label: ({ t }) => t('website:blocks:ComparisonTable:introContent:label'),
        },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'default',
          label: ({ t }) => t('website:blocks:ComparisonTable:style:label'),
          options: [
            {
              label: ({ t }) => t('website:blocks:ComparisonTable:style:label'),
              value: 'default',
            },
            {
              label: ({ t }) => t('website:blocks:ComparisonTable:style:label'),
              value: 'centered',
            },
          ],
        },
        {
          name: 'header',
          type: 'group',
          admin: {
            hideGutter: true,
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'tableTitle',
                  type: 'text',
                  admin: {
                    placeholder: { en: 'Compare Features', bg: 'Сравни функциите' },
                    width: '40%',
                  },
                  label: ({ t }) => t('website:blocks:ComparisonTable:tableTitle:label'),
                  required: true,
                },
                {
                  name: 'columnOneHeader',
                  type: 'text',
                  admin: {
                    placeholder: { en: 'Payload', bg: 'Payload' },
                    width: '30%',
                  },
                  label: ({ t }) => t('website:blocks:ComparisonTable:columnOneHeader:label'),
                  required: true,
                },
                {
                  name: 'columnTwoHeader',
                  type: 'text',
                  admin: {
                    placeholder: { en: 'The other guys', bg: 'Конкуренцията' },
                    width: '30%',
                  },
                  label: ({ t }) => t('website:blocks:ComparisonTable:columnTwoHeader:label'),
                  required: true,
                },
              ],
            },
          ],
          label: ({ t }) => t('website:blocks:ComparisonTable:line75:label'),
        },
        {
          name: 'rows',
          type: 'array',
          // [cloudflare/d1] 63-char limit; Drizzle auto-name overflows.
          dbName: 'cmp_rows',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'feature',
                  type: 'text',
                  admin: {
                    placeholder: { en: 'Feature', bg: 'Функция' },
                    width: '40%',
                  },
                  label: false,
                  required: true,
                },
                {
                  name: 'columnOneCheck',
                  type: 'checkbox',
                  admin: {
                    components: {
                      Field: '@root/components/TableCheckboxField',
                    },
                  },
                  label: false,
                },
                {
                  name: 'columnOne',
                  type: 'text',
                  admin: {
                    style: {
                      alignSelf: 'flex-end',
                    },
                    width: 'calc(30% - 50px)',
                  },
                  label: false,
                },
                {
                  name: 'columnTwoCheck',
                  type: 'checkbox',
                  admin: {
                    components: {
                      Field: '@root/components/TableCheckboxField',
                    },
                  },
                  label: false,
                },
                {
                  name: 'columnTwo',
                  type: 'text',
                  admin: {
                    style: {
                      alignSelf: 'flex-end',
                    },
                    width: 'calc(30% - 50px)',
                  },
                  label: false,
                },
              ],
            },
          ],
          label: ({ t }) => t('website:blocks:ComparisonTable:line141:label'),
          maxRows: 10,
          minRows: 1,
        },
      ],
    }),
  ],
  interfaceName: 'ComparisonTableType',
}
