import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import linkGroup from '../../fields/linkGroup'
import richText from '../../fields/richText'

export const ContentGrid: Block = {
  slug: 'contentGrid',
  fields: [
    blockFields({
      name: 'contentGridFields',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'style',
              type: 'select',
              defaultValue: 'gridBelow',
              label: ({ t }) => t('website:blocks:ContentGrid:style:label'),
              options: [
                { label: 'Grid Below', value: 'gridBelow' },
                { label: 'Side by Side', value: 'sideBySide' },
              ],
            },
            {
              name: 'showNumbers',
              type: 'checkbox',
            },
          ],
        },
        richText({
          name: 'content',
          label: ({ t }) => t('website:blocks:ContentGrid:content:label'),
          required: false,
        }),
        linkGroup({
          appearances: false,
          overrides: {},
        }),
        {
          name: 'cells',
          type: 'array',
          fields: [
            {
              name: 'content',
              type: 'richText',
              required: true,
            },
          ],
          maxRows: 8,
          minRows: 1,
        },
      ],
    }),
  ],
}
