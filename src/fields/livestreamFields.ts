import type { Field } from 'payload'

const livestreamFields: Field = {
  name: 'livestream',
  type: 'group',
  admin: {
    condition: (_, { type }) => type === 'livestream',
    hideGutter: true,
    style: {
      margin: 0,
      padding: 0,
    },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'id',
          type: 'text',
          label: ({ t }) => t('website:fields:livestreamFields:id:label'),
        },
        {
          name: 'date',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
          label: ({ t }) => t('website:fields:livestreamFields:date:label'),
          required: true,
        },
      ],
    },
    {
      name: 'hideBreadcrumbs',
      type: 'checkbox',
    },
    {
      name: 'richText',
      type: 'richText',
    },
    {
      name: 'guests',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
            },
            {
              name: 'link',
              type: 'text',
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
  label: false,
}

export default livestreamFields
