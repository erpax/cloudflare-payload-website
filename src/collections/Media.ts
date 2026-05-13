import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

export const Media: CollectionConfig<'media'> = {
  slug: 'media',
  labels: {
    singular: { en: 'Media file', bg: 'Медиен файл' },
    plural: { en: 'Media', bg: 'Медии' },
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  defaultPopulate: {
    alt: true,
    darkModeFallback: true,
    filename: true,
    height: true,
    mimeType: true,
    url: true,
    width: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'darkModeFallback',
      type: 'upload',
      admin: {
        description: ({ t }) => t('website:collections:Media:darkModeFallback:description'),
      },
      relationTo: 'media',
    },
  ],
  upload: true,
}
