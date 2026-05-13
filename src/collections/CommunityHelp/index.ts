import type { CollectionConfig } from 'payload'

import { isAdmin } from '../../access/isAdmin'
import { extractDescription } from './extract-description'

export const CommunityHelp: CollectionConfig = {
  slug: 'community-help',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'communityHelpType',
      type: 'radio',
      access: {
        update: () => false,
      },
      label: ({ t }) => t('website:collections:CommunityHelp:communityHelpType:label'),
      options: [
        {
          label: ({ t }) => t('website:collections:CommunityHelp:communityHelpType:label'),
          value: 'discord',
        },
        {
          label: ({ t }) => t('website:collections:CommunityHelp:line36:label'),
          value: 'github',
        },
      ],
    },
    {
      name: 'githubID',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.communityHelpType === 'github',
      },
      index: true,
      label: ({ t }) => t('website:collections:CommunityHelp:githubID:label'),
    },
    {
      name: 'discordID',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.communityHelpType === 'discord',
      },
      index: true,
      label: ({ t }) => t('website:collections:CommunityHelp:discordID:label'),
    },
    {
      name: 'communityHelpJSON',
      type: 'json',
      required: true,
    },
    {
      name: 'introDescription',
      type: 'text',
      hidden: true,
      hooks: {
        afterRead: [
          ({ data }) => {
            if (data?.communityHelpType === 'discord') {
              return extractDescription(data.communityHelpJSON.intro.content)
            }
            return extractDescription(data?.communityHelpJSON.body)
          },
        ],
        beforeChange: [
          ({ siblingData }) => {
            delete siblingData.introDescription
          },
        ],
      },
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      index: true,
      label: ({ t }) => t('website:collections:CommunityHelp:slug:label'),
    },
    {
      name: 'helpful',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
      // Search re-sync happens automatically via plugin-search's
      // beforeChange hook on this collection, so no afterChange wiring is
      // needed here when `helpful` toggles.
    },
    {
      name: 'relatedDocs',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      index: true,
      relationTo: 'docs',
    },
    {
      name: 'threadCreatedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  labels: {
    plural: ({ t }) => t('website:collections:CommunityHelp:community-help:plural'),
    singular: ({ t }) => t('website:collections:CommunityHelp:community-help:singular'),
  },
}
