import type { CollectionConfig } from 'payload'

import { revalidatePath } from 'next/cache'

import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { slugField } from '../fields/slug'
import { formatPreviewURL } from '../utilities/formatPreviewURL'

export const Partners: CollectionConfig = {
  slug: 'partners',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: { en: 'Partner Program', bg: 'Партньорска програма' },
    livePreview: {
      url: ({ data }) => formatPreviewURL('partners', data),
    },
    preview: (doc) => formatPreviewURL('partners', doc),
    useAsTitle: 'name',
  },
  defaultPopulate: {
    name: true,
    slug: true,
    budgets: true,
    caseStudy: {
      slug: true,
      featuredImage: true,
      meta: {
        description: true,
      },
      title: true,
    },
    content: {
      bannerImage: true,
    },
    industries: true,
    regions: true,
    specialties: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: ({ t }) => t('website:collections:Partners:name:label'),
      required: true,
    },
    {
      name: 'website',
      type: 'text',
      label: ({ t }) => t('website:collections:Partners:website:label'),
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      access: {
        read: isAdminFieldLevel,
      },
      label: ({ t }) => t('website:collections:Partners:email:label'),
      required: true,
    },
    slugField('name', {
      admin: {
        position: 'sidebar',
      },
      required: true,
    }),
    {
      name: 'agency_status',
      type: 'select',
      admin: {
        description: ({ t }) => t('website:collections:Partners:agency_status:description'),
        position: 'sidebar',
      },
      defaultValue: 'active',
      options: [
        {
          label: ({ t }) => t('website:collections:Partners:agency_status:label'),
          value: 'active',
        },
        {
          label: ({ t }) => t('website:collections:Partners:line86:label'),
          value: 'inactive',
        },
      ],
    },
    {
      name: 'hubspotID',
      type: 'text',
      access: {
        read: isAdminFieldLevel,
      },
      admin: {
        position: 'sidebar',
      },
      label: ({ t }) => t('website:collections:Partners:hubspotID:label'),
    },
    {
      name: 'logo',
      type: 'upload',
      admin: {
        position: 'sidebar',
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: {
        description:
          'This field is managed by the Featured Partners field in the Partner Program collection',
        position: 'sidebar',
        readOnly: true,
      },
      label: ({ t }) => t('website:collections:Partners:featured:label'),
    },
    {
      name: 'topContributor',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
      label: ({ t }) => t('website:collections:Partners:topContributor:label'),
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'content',
          fields: [
            {
              name: 'bannerImage',
              type: 'upload',
              admin: {
                description: ({ t }) => t('website:collections:Partners:bannerImage:description'),
              },
              relationTo: 'media',
              required: true,
            },
            {
              name: 'overview',
              type: 'richText',
              label: ({ t }) => t('website:collections:Partners:overview:label'),
              required: true,
            },
            {
              name: 'services',
              type: 'richText',
              label: ({ t }) => t('website:collections:Partners:services:label'),
              required: true,
            },
            {
              name: 'idealProject',
              type: 'richText',
              label: ({ t }) => t('website:collections:Partners:idealProject:label'),
              required: true,
            },
            {
              name: 'caseStudy',
              type: 'relationship',
              relationTo: 'case-studies',
            },
            {
              name: 'contributions',
              type: 'array',
              admin: {
                description:
                  "Contributions to Payload. Must be a valid GitHub issue, pull request, or discussion URL from a repo in the 'payloadcms' organization.",
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'type',
                      type: 'select',
                      admin: {
                        width: '50%',
                      },
                      options: [
                        {
                          label: ({ t }) => t('website:collections:Partners:type:label'),
                          value: 'discussion',
                        },
                        {
                          label: ({ t }) => t('website:collections:Partners:line191:label'),
                          value: 'pr',
                        },
                        {
                          label: ({ t }) => t('website:collections:Partners:line195:label'),
                          value: 'issue',
                        },
                      ],
                      required: true,
                    },
                    {
                      name: 'repo',
                      type: 'text',
                      admin: {
                        width: '25%',
                        // description: ({ path, value }) => `github.com/payloadcms/${value || ''}`,
                      },
                      defaultValue: 'payload',
                      required: true,
                    },
                    {
                      name: 'number',
                      type: 'number',
                      admin: {
                        width: '25%',
                      },
                      required: true,
                    },
                  ],
                },
              ],
              label: ({ t }) => t('website:collections:Partners:number:label'),
            },
            {
              name: 'projects',
              type: 'array',
              fields: [
                {
                  name: 'year',
                  type: 'number',
                  required: true,
                },
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'link',
                  type: 'text',
                  required: true,
                },
              ],
              label: ({ t }) => t('website:collections:Partners:link:label'),
              maxRows: 4,
            },
          ],
          label: ({ t }) => t('website:collections:Partners:link:label'),
        },
        {
          fields: [
            {
              name: 'city',
              type: 'text',
              required: true,
            },
            {
              name: 'regions',
              type: 'relationship',
              hasMany: true,
              relationTo: 'regions',
              required: true,
            },
            {
              name: 'specialties',
              type: 'relationship',
              hasMany: true,
              relationTo: 'specialties',
              required: true,
            },
            {
              name: 'budgets',
              type: 'relationship',
              hasMany: true,
              relationTo: 'budgets',
              required: true,
            },
            {
              name: 'industries',
              type: 'relationship',
              hasMany: true,
              relationTo: 'industries',
              required: true,
            },
            {
              name: 'social',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      admin: {
                        width: '50%',
                      },
                      label: ({ t }) => t('website:collections:Partners:platform:label'),
                      options: [
                        {
                          label: ({ t }) => t('website:collections:Partners:platform:label'),
                          value: 'linkedin',
                        },
                        {
                          label: ({ t }) => t('website:collections:Partners:line305:label'),
                          value: 'twitter',
                        },
                        {
                          label: ({ t }) => t('website:collections:Partners:line309:label'),
                          value: 'facebook',
                        },
                        {
                          label: ({ t }) => t('website:collections:Partners:line313:label'),
                          value: 'instagram',
                        },
                        {
                          label: ({ t }) => t('website:collections:Partners:line317:label'),
                          value: 'youtube',
                        },
                        {
                          label: ({ t }) => t('website:collections:Partners:line321:label'),
                          value: 'github',
                        },
                      ],
                      required: true,
                    },
                    {
                      name: 'url',
                      type: 'text',
                      admin: {
                        width: '50%',
                      },
                      label: ({ t }) => t('website:collections:Partners:url:label'),
                      required: true,
                    },
                  ],
                },
              ],
              label: ({ t }) => t('website:collections:Partners:line339:label'),
            },
          ],
          label: ({ t }) => t('website:collections:Partners:line342:label'),
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidatePath(`/partners/${doc.slug}`)
        revalidatePath(`/partners`, 'page')
        console.log(`Revalidated: /partners/${doc.slug}`)
      },
    ],
  },
  labels: {
    plural: ({ t }) => t('website:collections:Partners:partners:plural'),
    singular: ({ t }) => t('website:collections:Partners:partners:singular'),
  },
  versions: {
    drafts: true,
  },
}
