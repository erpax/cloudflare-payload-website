import type { GlobalConfig } from 'payload'

import { revalidatePath } from 'next/cache'

import { isAdmin } from '../access/isAdmin'
import linkGroup from '../fields/linkGroup'

export const PartnerProgram: GlobalConfig = {
  slug: 'partner-program',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: { en: 'Partner Program', bg: 'Партньорска програма' },
  },
  fields: [
    {
      name: 'contactForm',
      type: 'relationship',
      admin: {
        description: ({ t }) => t('website:globals:PartnerProgram:contactForm:description'),
      },
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'richText',
          type: 'richText',
          label: ({ t }) => t('website:globals:PartnerProgram:richText:label'),
        },
        linkGroup({
          appearances: false,
          overrides: {
            name: 'breadcrumbBarLinks',
          },
        }),
        linkGroup({
          appearances: false,
          overrides: {
            name: 'heroLinks',
          },
        }),
      ],
    },
    {
      name: 'featuredPartners',
      type: 'group',
      fields: [
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'partners',
          type: 'relationship',
          hasMany: true,
          hooks: {
            afterChange: [
              async ({ previousValue, req, value }) => {
                if (value !== previousValue) {
                  const payload = await req.payload
                  await payload
                    .update({
                      collection: 'partners',
                      data: {
                        featured: false,
                      },
                      where: {
                        featured: {
                          equals: true,
                        },
                      },
                    })
                    .then(async () => {
                      await payload.update({
                        collection: 'partners',
                        data: {
                          featured: true,
                        },
                        where: {
                          id: {
                            in: value,
                          },
                        },
                      })
                    })
                }
              },
            ],
          },
          maxRows: 4,
          minRows: 4,
          relationTo: 'partners',
          required: true,
        },
      ],
    },
    {
      name: 'contentBlocks',
      type: 'group',
      fields: [
        {
          name: 'beforeDirectory',
          type: 'blocks',
          blockReferences: [
            'callout',
            'cta',
            'cardGrid',
            'caseStudyCards',
            'caseStudiesHighlight',
            'caseStudyParallax',
            'codeFeature',
            'content',
            'contentGrid',
            'form',
            'hoverCards',
            'hoverHighlights',
            'linkGrid',
            'logoGrid',
            'mediaBlock',
            'mediaContent',
            'mediaContentAccordion',
            'pricing',
            'reusableContentBlock',
            'slider',
            'statement',
            'steps',
            'stickyHighlights',
            'exampleTabs',
          ],
          blocks: [],
          label: ({ t }) => t('website:globals:PartnerProgram:line137:label'),
          labels: {
            plural: ({ t }) => t('website:globals:PartnerProgram:partner-program:plural'),
            singular: ({ t }) => t('website:globals:PartnerProgram:partner-program:singular'),
          },
        },
        {
          name: 'afterDirectory',
          type: 'blocks',
          blockReferences: [
            'callout',
            'cta',
            'cardGrid',
            'caseStudyCards',
            'caseStudiesHighlight',
            'caseStudyParallax',
            'codeFeature',
            'content',
            'contentGrid',
            'form',
            'hoverCards',
            'hoverHighlights',
            'linkGrid',
            'logoGrid',
            'mediaBlock',
            'mediaContent',
            'mediaContentAccordion',
            'pricing',
            'reusableContentBlock',
            'slider',
            'statement',
            'steps',
            'stickyHighlights',
            'exampleTabs',
          ],
          blocks: [],
          label: ({ t }) => t('website:globals:PartnerProgram:line173:label'),
          labels: {
            plural: ({ t }) => t('website:globals:PartnerProgram:partner-program:plural'),
            singular: ({ t }) => t('website:globals:PartnerProgram:partner-program:singular'),
          },
        },
      ],
      label: false,
    },
  ],
  hooks: {
    afterChange: [() => revalidatePath('/parters', 'layout')],
  },
  label: ({ t }) => t('website:globals:PartnerProgram:line186:label'),
}
