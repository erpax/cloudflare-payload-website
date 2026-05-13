import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'
import richText from '../../fields/richText'

export const CaseStudyCards: Block = {
  slug: 'caseStudyCards',
  fields: [
    blockFields({
      name: 'caseStudyCardFields',
      fields: [
        {
          name: 'pixels',
          type: 'checkbox',
          defaultValue: true,
          label: ({ t }) => t('website:blocks:CaseStudyCards:pixels:label'),
        },
        {
          name: 'cards',
          type: 'array',
          // [cloudflare/d1] Drizzle auto-name overflows SQLite's 63-char limit.
          dbName: 'cs_cards_items',
          fields: [
            richText(),
            {
              name: 'caseStudy',
              type: 'relationship',
              relationTo: 'case-studies',
              required: true,
            },
          ],
        },
      ],
    }),
  ],
  labels: {
    plural: ({ t }) => t('website:blocks:CaseStudyCards:caseStudyCards:plural'),
    singular: ({ t }) => t('website:blocks:CaseStudyCards:caseStudyCards:singular'),
  },
}
