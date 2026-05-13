import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import codeBlips from '../../fields/codeBlips'

export const Code: Block = {
  slug: 'code',
  fields: [
    blockFields({
      name: 'codeFields',
      fields: [
        {
          name: 'language',
          type: 'select',
          defaultValue: 'none',
          options: [
            {
              label: ({ t }) => t('website:blocks:Code:language:label'),
              value: 'none',
            },
            {
              label: ({ t }) => t('website:blocks:Code:language:label'),
              value: 'js',
            },
            {
              label: ({ t }) => t('website:blocks:Code:line26:label'),
              value: 'ts',
            },
          ],
        },
        {
          name: 'code',
          type: 'code',
          required: true,
        },
        codeBlips,
      ],
    }),
  ],
}
