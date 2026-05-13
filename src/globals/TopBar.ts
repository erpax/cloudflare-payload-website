import type { GlobalConfig } from 'payload'

import link from '@root/fields/link'
import { revalidatePath } from 'next/cache'

export const TopBar: GlobalConfig = {
  slug: 'topBar',
  label: { en: 'Top Bar', bg: 'Горна лента' },
  fields: [
    {
      name: 'enableTopBar',
      type: 'checkbox',
      label: ({ t }) => t('website:globals:TopBar:enableTopBar:label'),
    },
    {
      name: 'message',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData.enableTopBar,
      },
      label: ({ t }) => t('website:globals:TopBar:message:label'),
      required: true,
    },
    link({
      appearances: false,
      overrides: {
        admin: {
          condition: (_, siblingData) => siblingData.enableTopBar,
        },
      },
    }),
  ],
  hooks: {
    afterChange: [() => revalidatePath('/', 'layout')],
  },
}
