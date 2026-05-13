import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'

export const BlogMarkdown: Block = {
  slug: 'blogMarkdown',
  fields: [
    blockFields({
      name: 'blogMarkdownFields',
      fields: [
        {
          name: 'markdown',
          type: 'text',
          admin: {
            components: {
              Field: '@root/blocks/BlogMarkdown/Field#BlogMarkdownField',
            },
          },
          required: true,
        },
      ],
    }),
  ],
  labels: {
    plural: ({ t }) => t('website:blocks:BlogMarkdown:blogMarkdown:plural'),
    singular: ({ t }) => t('website:blocks:BlogMarkdown:blogMarkdown:singular'),
  },
}
