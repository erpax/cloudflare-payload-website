import type { ArrayField } from 'payload'

import link from './link'
import richText from './richText'

const codeBlips: ArrayField = {
  name: 'codeBlips',
  type: 'array',
  fields: [
    {
      name: 'row',
      type: 'number',
      required: true,
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    richText({ name: 'feature', required: true }),
    {
      name: 'enableLink',
      type: 'checkbox',
    },
    link({
      appearances: false,
      overrides: {
        admin: {
          condition: (_, { enableLink } = {}) => Boolean(enableLink),
        },
      },
    }),
  ],
  labels: {
    plural: ({ t }) => t('website:fields:codeBlips:line35:plural'),
    singular: ({ t }) => t('website:fields:codeBlips:line36:singular'),
  },
}

export default codeBlips
