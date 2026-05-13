import type { Field } from 'payload'

import { themeField } from './blockFields'
import link from './link'
import linkGroup from './linkGroup'
import livestreamFields from './livestreamFields'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'default',
      label: ({ t }) => t('website:fields:hero:type:label'),
      options: [
        {
          label: ({ t }) => t('website:fields:hero:type:label'),
          value: 'default',
        },
        {
          label: ({ t }) => t('website:fields:hero:type:label'),
          value: 'contentMedia',
        },
        {
          label: ({ t }) => t('website:fields:hero:line27:label'),
          value: 'centeredContent',
        },
        {
          label: ({ t }) => t('website:fields:hero:line31:label'),
          value: 'form',
        },
        {
          label: ({ t }) => t('website:fields:hero:line35:label'),
          value: 'home',
        },
        {
          label: ({ t }) => t('website:fields:hero:line39:label'),
          value: 'homeNew',
        },
        {
          label: ({ t }) => t('website:fields:hero:line43:label'),
          value: 'livestream',
        },
        {
          label: ({ t }) => t('website:fields:hero:line47:label'),
          value: 'gradient',
        },
        {
          label: ({ t }) => t('website:fields:hero:line51:label'),
          value: 'three',
        },
      ],
      required: true,
    },
    {
      name: 'fullBackground',
      type: 'checkbox',
      admin: {
        condition: (_, { type } = {}) => type === 'gradient',
      },
    },
    themeField(100),
    {
      type: 'collapsible',
      fields: [
        {
          name: 'enableBreadcrumbsBar',
          type: 'checkbox',
          label: ({ t }) => t('website:fields:hero:enableBreadcrumbsBar:label'),
        },
        linkGroup({
          appearances: false,
          overrides: {
            name: 'breadcrumbsBarLinks',
            admin: {
              condition: (_, { enableBreadcrumbsBar } = {}) => Boolean(enableBreadcrumbsBar),
            },
            labels: {
              plural: ({ t }) => t('website:fields:hero:line81:plural'),
              singular: ({ t }) => t('website:fields:hero:line82:singular'),
            },
          },
        }),
      ],
      label: ({ t }) => t('website:fields:hero:line87:label'),
    },
    livestreamFields,
    {
      name: 'enableAnnouncement',
      type: 'checkbox',
      admin: {
        condition: (_, { type }) => ['home', 'homeNew'].includes(type),
      },
      label: ({ t }) => t('website:fields:hero:enableAnnouncement:label'),
    },
    link({
      appearances: false,
      overrides: {
        name: 'announcementLink',
        admin: {
          condition: (_, { enableAnnouncement }) => enableAnnouncement,
        },
      },
    }),
    {
      name: 'richText',
      type: 'richText',
      admin: {
        condition: (_, { type } = {}) => type !== 'livestream',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        condition: (_, { type } = {}) =>
          type !== 'livestream' &&
          type !== 'centeredContent' &&
          type !== 'three' &&
          type !== 'homeNew',
      },
    },
    linkGroup({
      additions: {
        npmCta: true,
      },
      appearances: false,
      overrides: {
        name: 'primaryButtons',
        admin: {
          condition: (_, { type }) => ['home', 'homeNew'].includes(type),
        },
        label: ({ t }) => t('website:fields:hero:primaryButtons:label'),
      },
    }),
    {
      name: 'secondaryHeading',
      type: 'richText',
      admin: {
        condition: (_, { type }) => ['home'].includes(type),
      },
    },
    {
      name: 'secondaryDescription',
      type: 'richText',
      admin: {
        condition: (_, { type }) => type === 'home',
      },
    },
    linkGroup({
      overrides: {
        admin: {
          condition: (_, { type } = {}) =>
            ['centeredContent', 'contentMedia', 'default', 'gradient', 'livestream'].includes(type),
        },
      },
    }),
    {
      name: 'threeCTA',
      type: 'radio',
      admin: {
        condition: (_, { type }) => type === 'three',
      },
      label: ({ t }) => t('website:fields:hero:threeCTA:label'),
      options: [
        {
          label: ({ t }) => t('website:fields:hero:threeCTA:label'),
          value: 'newsletter',
        },
        {
          label: ({ t }) => t('website:fields:hero:line173:label'),
          value: 'buttons',
        },
      ],
      required: true,
    },
    {
      name: 'newsletter',
      type: 'group',
      admin: {
        condition: (_, { type, threeCTA }) => type === 'three' && threeCTA === 'newsletter',
        hideGutter: true,
      },
      fields: [
        {
          name: 'placeholder',
          type: 'text',
          admin: { placeholder: 'Enter your email' },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            placeholder: { en: 'Sign up to receive periodic updates and feature releases to your email.', bg: 'Абонирайте се, за да получавате периодични актуализации и новости на имейла си.' },
          },
        },
      ],
    },
    {
      name: 'buttons',
      type: 'blocks',
      admin: {
        condition: (_, { type, threeCTA }) => type === 'three' && threeCTA === 'buttons',
      },
      blockReferences: ['link', 'command'],
      blocks: [],
      labels: {
        plural: ({ t }) => t('website:fields:hero:line210:plural'),
        singular: ({ t }) => t('website:fields:hero:line211:singular'),
      },
    },
    linkGroup({
      appearances: false,
      overrides: {
        name: 'secondaryButtons',
        admin: {
          condition: (_, { type }) => ['home'].includes(type),
        },
        label: ({ t }) => t('website:fields:hero:secondaryButtons:label'),
      },
    }),
    {
      name: 'images',
      type: 'array',
      admin: {
        condition: (_, { type } = {}) => ['gradient', 'homeNew', 'three'].includes(type),
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
      minRows: 1,
    },
    {
      name: 'enableMedia',
      type: 'checkbox',
      admin: {
        condition: (_, { type }) => type === 'centeredContent',
      },
      defaultValue: false,
    },
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type, enableMedia } = {}) =>
          ['contentMedia', 'home'].includes(type) || (enableMedia && type === 'centeredContent'),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'secondaryMedia',
      type: 'upload',
      admin: {
        condition: (_, { type }) => type === 'home',
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'featureVideo',
      type: 'upload',
      admin: {
        condition: (_, { type }) => ['home'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'form',
      type: 'relationship',
      admin: {
        condition: (_, { type }) => type === 'form',
      },
      relationTo: 'forms',
    },
    {
      name: 'logos',
      type: 'array',
      admin: {
        condition: (_, { type }) => type === 'home',
      },
      fields: [
        {
          name: 'logoMedia',
          type: 'upload',
          label: ({ t }) => t('website:fields:hero:logoMedia:label'),
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'logoShowcaseLabel',
      type: 'richText',
      admin: {
        condition: (_, { type }) => type === 'homeNew',
      },
    },
    {
      name: 'logoShowcase',
      type: 'upload',
      admin: {
        condition: (_, { type }) => type === 'homeNew',
      },
      hasMany: true,
      minRows: 7,
      relationTo: 'media',
    },
  ],
  label: false,
}
