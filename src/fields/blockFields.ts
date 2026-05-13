import type { Field, GroupField } from 'payload'

import deepMerge from '../utilities/deepMerge'
import { shortEnumName } from '../utilities/shortEnumName'

interface Args {
  fields: Field[]
  name: string
  overrides?: Partial<GroupField>
}

export const themeField: (width?: number) => Field = (width) => ({
  name: 'theme',
  type: 'select',
  enumName: ({ tableName }) => shortEnumName(`enum_${tableName}_theme`),
  admin: {
    description: ({ t }) => t('website:fields:blockFields:theme:description'),
    width: width ? `${width}%` : '50%',
  },
  options: [
    {
      label: ({ t }) => t('website:fields:blockFields:theme:label'),
      value: 'light',
    },
    {
      label: ({ t }) => t('website:fields:blockFields:line24:label'),
      value: 'dark',
    },
  ],
})

export const backgroundField: Field = {
  name: 'background',
  type: 'select',
  enumName: ({ tableName }) => shortEnumName(`enum_${tableName}_background`),
  admin: {
    width: '50%',
  },
  options: [
    {
      label: ({ t }) => t('website:fields:blockFields:background:label'),
      value: 'solid',
    },
    {
      label: ({ t }) => t('website:fields:blockFields:line42:label'),
      value: 'transparent',
    },
    {
      label: ({ t }) => t('website:fields:blockFields:line46:label'),
      value: 'gradientUp',
    },
    {
      label: ({ t }) => t('website:fields:blockFields:line50:label'),
      value: 'gradientDown',
    },
  ],
}

export const blockFields = ({ name, fields, overrides }: Args): Field =>
  deepMerge(
    {
      name,
      type: 'group',
      admin: {
        hideGutter: true,
        style: {
          margin: 0,
          padding: 0,
        },
      },
      fields: [
        {
          type: 'collapsible',
          fields: [
            {
              name: 'settings',
              type: 'group',
              admin: {
                hideGutter: true,
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [themeField(), backgroundField],
                },
              ],
              label: false,
            },
          ],
          label: ({ t }) => t('website:fields:blockFields:line88:label'),
        },
        ...fields,
      ],
      label: false,
    },
    overrides,
  )
