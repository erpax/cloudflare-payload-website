import type { CollectionConfig } from 'payload'

import { isAdmin } from '@root/access/isAdmin'
import { revalidatePath, revalidateTag } from 'next/cache'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: { en: 'Category', bg: 'Категория' },
    plural: { en: 'Categories', bg: 'Категории' },
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            width: '50%',
          },
          label: ({ t }) => t('website:collections:Categories:name:label'),
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          admin: {
            width: '50%',
          },
          label: ({ t }) => t('website:collections:Categories:slug:label'),
          required: true,
        },
      ],
    },
    {
      name: 'headline',
      type: 'text',
      label: ({ t }) => t('website:collections:Categories:headline:label'),
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: ({ t }) => t('website:collections:Categories:description:label'),
      required: true,
    },
    {
      name: 'posts',
      type: 'join',
      collection: 'posts',
      defaultLimit: 0,
      label: ({ t }) => t('website:collections:Categories:posts:label'),
      maxDepth: 2,
      on: 'category',
    },
  ],
  forceSelect: {
    name: true,
    slug: true,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc }) => {
        revalidatePath(`/posts/${doc.slug}`)
        revalidateTag('archives', 'max')

        if (doc.slug !== previousDoc?.slug) {
          revalidatePath(`/posts/${previousDoc?.slug}`)
        }
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        revalidatePath(`/posts/${doc.slug}`)
        revalidateTag('archives', 'max')
      },
    ],
  },
}
