import type { Block, Field, GlobalConfig } from 'payload'

import { isAdmin } from '@root/access/isAdmin'
import linkGroup from '@root/fields/linkGroup'
import { revalidatePath } from 'next/cache'

const tabBlock: (slug: string, fields: Field[]) => Block = (slug, fields) => {
  return {
    slug,
    fields: [
      {
        name: 'label',
        type: 'text',
        label: ({ t }) => t('website:globals:GetStarted:label:label'),
        required: true,
      },
      ...fields,
    ],
  }
}
const richTextBlock: Block = tabBlock('richTextBlock', [
  {
    name: 'content',
    type: 'richText',
    required: true,
  },
])
export const GetStarted: GlobalConfig = {
  slug: 'get-started',
  label: { en: 'Get Started', bg: 'Първи стъпки' },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'Get started with Payload',
              label: ({ t }) => t('website:globals:GetStarted:heading:label'),
            },
            {
              name: 'tabs',
              type: 'blocks',
              blocks: [richTextBlock],
              labels: {
                plural: ({ t }) => t('website:globals:GetStarted:get-started:plural'),
                singular: ({ t }) => t('website:globals:GetStarted:get-started:singular'),
              },
            },
          ],
          label: ({ t }) => t('website:globals:GetStarted:tabs:label'),
        },
        {
          fields: [
            {
              name: 'sidebar',
              type: 'richText',
              admin: {
                position: 'sidebar',
              },
              label: ({ t }) => t('website:globals:GetStarted:sidebar:label'),
            },
            linkGroup({
              appearances: false,
              overrides: {
                name: 'sidebarLinks',
              },
            }),
          ],
          label: ({ t }) => t('website:globals:GetStarted:sidebarLinks:label'),
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      () => {
        revalidatePath('/get-started')
        console.log('Revalidated /get-started')
      },
    ],
  },
}
