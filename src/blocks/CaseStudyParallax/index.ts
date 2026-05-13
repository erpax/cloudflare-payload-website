import type { Block } from 'payload'

import { blockFields } from '../../fields/blockFields'

export const CaseStudyParallax: Block = {
  slug: 'caseStudyParallax',
  fields: [
    blockFields({
      name: 'caseStudyParallaxFields',
      fields: [
        {
          name: 'items',
          type: 'array',
          // [cloudflare/d1] 63-char limit; Drizzle auto-name overflows.
          dbName: 'csp_items',
          fields: [
            {
              name: 'quote',
              type: 'textarea',
              required: true,
            },
            {
              name: 'author',
              type: 'text',
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'images',
              type: 'array',
              // [cloudflare/d1] Nested under items; 63-char limit applies.
              dbName: 'csp_item_images',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'tabLabel',
                  type: 'text',
                  admin: {
                    description: 'A label for the navigation tab at the bottom of the parallax',
                  },
                  required: true,
                },
                {
                  name: 'caseStudy',
                  type: 'relationship',
                  relationTo: 'case-studies',
                  required: true,
                },
              ],
            },
          ],
          maxRows: 4,
          minRows: 4,
        },
      ],
    }),
  ],
  labels: {
    plural: 'Case Study Parallax',
    singular: 'Case Study Parallax',
  },
}
