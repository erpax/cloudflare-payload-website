import type { Field, GroupField } from 'payload'

import deepMerge from '@utilities/deepMerge'

export const appearanceOptions = {
  default: {
    label: ({ t }) => t('website:fields:link:line7:label'),
    value: 'default',
  },
  primary: {
    label: ({ t }) => t('website:fields:link:line11:label'),
    value: 'primary',
  },
  secondary: {
    label: ({ t }) => t('website:fields:link:line15:label'),
    value: 'secondary',
  },
}

export type LinkAppearances = 'default' | 'primary' | 'secondary'

type LinkType = (options?: {
  appearances?: false | LinkAppearances[]
  disableLabel?: boolean
  overrides?: Partial<GroupField>
}) => Field

const link: LinkType = ({ appearances, disableLabel = false, overrides = {} } = {}) => {
  const linkResult: Field = {
    name: 'link',
    type: 'group',
    admin: {
      hideGutter: true,
      ...(overrides?.admin || {}),
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'radio',
            // [cloudflare/d1] Stable short enumName — without this, the
            // auto-generated `enum_<collection>_<…>_link_type` overflows
            // SQLite's 63-char identifier limit under deeply nested blocks.
            enumName: 'enum_cms_link_type',
            admin: {
              layout: 'horizontal',
              width: '50%',
            },
            defaultValue: 'reference',
            options: [
              {
                label: ({ t }) => t('website:fields:link:line54:label'),
                value: 'reference',
              },
              {
                label: ({ t }) => t('website:fields:link:line58:label'),
                value: 'custom',
              },
            ],
          },
          {
            name: 'newTab',
            type: 'checkbox',
            admin: {
              style: {
                alignSelf: 'flex-end',
              },
              width: '25%',
            },
            label: ({ t }) => t('website:fields:link:newTab:label'),
          },
        ],
      },
    ],
  }

  const linkTypes: Field[] = [
    {
      name: 'reference',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
      label: ({ t }) => t('website:fields:link:reference:label'),
      maxDepth: 2,
      relationTo: ['pages', 'posts', 'case-studies'],
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
      label: ({ t }) => t('website:fields:link:url:label'),
      required: true,
    },
  ]

  if (!disableLabel) {
    linkResult.fields.push({
      type: 'row',
      fields: [
        ...linkTypes,
        {
          name: 'label',
          type: 'text',
          admin: {
            width: '25%',
          },
          label: ({ t }) => t('website:fields:link:label:label'),
          required: true,
        },
        {
          name: 'customId',
          type: 'text',
          admin: {
            width: '25%',
          },
        },
      ],
    })
  } else {
    linkResult.fields = [
      ...linkResult.fields,
      ...linkTypes,
      {
        name: 'customId',
        type: 'text',
        admin: {
          width: '25%',
        },
      },
    ]
  }

  if (appearances !== false) {
    let appearanceOptionsToUse = [
      appearanceOptions.default,
      appearanceOptions.primary,
      appearanceOptions.secondary,
    ]

    if (appearances) {
      appearanceOptionsToUse = appearances.map((appearance) => appearanceOptions[appearance])
    }

    linkResult.fields.push({
      name: 'appearance',
      type: 'select',
      // [cloudflare/d1] See `type` field above — same 63-char overflow.
      enumName: 'enum_cms_link_appearance',
      admin: {
        description: ({ t }) => t('website:fields:link:appearance:description'),
      },
      defaultValue: 'default',
      options: appearanceOptionsToUse,
    })
  }

  return deepMerge(linkResult, overrides)
}

export default link
