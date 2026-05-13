import type { GlobalConfig } from 'payload'

import { revalidatePath } from 'next/cache'

import { isAdmin } from '../access/isAdmin'
import link from '../fields/link'

export const MainMenu: GlobalConfig = {
  slug: 'main-menu',
  label: { en: 'Main Menu', bg: 'Главно меню' },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'tabs',
      type: 'array',
      admin: {
        components: {
          RowLabel: '@root/globals/CustomRowLabelTabs',
        },
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'enableDirectLink',
              type: 'checkbox',
            },
            {
              name: 'enableDropdown',
              type: 'checkbox',
            },
          ],
        },
        {
          type: 'collapsible',
          admin: {
            condition: (_, siblingData) => siblingData.enableDirectLink,
          },
          fields: [
            link({
              appearances: false,
              disableLabel: true,
            }),
          ],
          label: ({ t }) => t('website:globals:MainMenu:line53:label'),
        },
        {
          type: 'collapsible',
          admin: {
            condition: (_, siblingData) => siblingData.enableDropdown,
          },
          fields: [
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'descriptionLinks',
              type: 'array',
              fields: [
                link({
                  appearances: false,
                  overrides: {
                    label: false,
                  },
                }),
              ],
            },
            {
              name: 'navItems',
              type: 'array',
              admin: {
                components: {
                  RowLabel: '@root/globals/CustomRowLabelNavItems',
                },
              },
              fields: [
                {
                  name: 'style',
                  type: 'select',
                  defaultValue: 'default',
                  options: [
                    {
                      label: ({ t }) => t('website:globals:MainMenu:style:label'),
                      value: 'default',
                    },
                    {
                      label: ({ t }) => t('website:globals:MainMenu:style:label'),
                      value: 'featured',
                    },
                    {
                      label: ({ t }) => t('website:globals:MainMenu:line100:label'),
                      value: 'list',
                    },
                  ],
                },
                {
                  name: 'defaultLink',
                  type: 'group',
                  admin: {
                    condition: (_, siblingData) => siblingData.style === 'default',
                  },
                  fields: [
                    link({
                      appearances: false,
                      overrides: {
                        label: false,
                      },
                    }),
                    {
                      name: 'description',
                      type: 'textarea',
                    },
                  ],
                },
                {
                  name: 'featuredLink',
                  type: 'group',
                  admin: {
                    condition: (_, siblingData) => siblingData.style === 'featured',
                  },
                  fields: [
                    {
                      name: 'tag',
                      type: 'text',
                    },
                    {
                      name: 'label',
                      type: 'richText',
                    },
                    {
                      name: 'links',
                      type: 'array',
                      fields: [
                        link({
                          appearances: false,
                          overrides: {
                            label: false,
                          },
                        }),
                      ],
                    },
                  ],
                },
                {
                  name: 'listLinks',
                  type: 'group',
                  admin: {
                    condition: (_, siblingData) => siblingData.style === 'list',
                  },
                  fields: [
                    {
                      name: 'tag',
                      type: 'text',
                    },
                    {
                      name: 'links',
                      type: 'array',
                      fields: [
                        link({
                          appearances: false,
                          overrides: {
                            label: false,
                          },
                        }),
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          label: ({ t }) => t('website:globals:MainMenu:line181:label'),
        },
      ],
      label: ({ t }) => t('website:globals:MainMenu:line184:label'),
    },
    link({
      appearances: false,
      overrides: {
        name: 'menuCta',
        label: ({ t }) => t('website:globals:MainMenu:menuCta:label'),
      },
    }),
  ],
  hooks: {
    afterChange: [() => revalidatePath('/', 'layout')],
  },
}
