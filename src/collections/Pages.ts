import type { CollectionConfig } from 'payload'

import { revalidatePath } from 'next/cache'

import { isAdmin } from '../access/isAdmin'
import { publishedOnly } from '../access/publishedOnly'
import { fullTitle } from '../fields/fullTitle'
import { hero } from '../fields/hero'
import { slugField } from '../fields/slug'
import { formatPreviewURL } from '../utilities/formatPreviewURL'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { en: 'Page', bg: 'Страница' },
    plural: { en: 'Pages', bg: 'Страници' },
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publishedOnly,
    readVersions: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['fullTitle', 'slug', 'createdAt', 'updatedAt'],
    livePreview: {
      url: ({ data }) => formatPreviewURL('pages', data),
    },
    preview: (doc) => formatPreviewURL('pages', doc),
    useAsTitle: 'fullTitle',
  },
  defaultPopulate: {
    slug: true,
    breadcrumbs: true,
    title: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    fullTitle,
    {
      name: 'noindex',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
      label: ({ t }) => t('website:collections:Pages:noindex:label'),
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: ({ t }) => t('website:collections:Pages:line54:label'),
        },
        {
          fields: [
            {
              name: 'layout',
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
                'comparisonTable',
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
              required: true,
            },
          ],
          label: ({ t }) => t('website:collections:Pages:line92:label'),
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        if (doc._status === 'published' || doc._status !== previousDoc._status) {
          if (doc.breadcrumbs && doc.breadcrumbs.length > 0) {
            revalidatePath(doc.breadcrumbs[doc.breadcrumbs.length - 1].url)
            console.log(`Revalidated: ${doc.breadcrumbs[doc.breadcrumbs.length - 1].url}`)
            if (doc.breadcrumbs[0].url === '/home') {
              revalidatePath('/')
              console.log(`Revalidated: /`)
            }
          } else {
            revalidatePath(`/${doc.slug}`)
            console.log(`Revalidated: /${doc.slug}`)
            if (doc.slug === 'home') {
              revalidatePath('/')
              console.log(`Revalidated: /`)
            }
          }
        }
      },
    ],
  },
  versions: {
    drafts: true,
  },
}
