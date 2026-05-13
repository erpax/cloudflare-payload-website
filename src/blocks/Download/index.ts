import type { Block } from 'payload'

export const DownloadBlock: Block = {
  slug: 'downloadBlock',
  fields: [
    {
      name: 'downloads',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'file',
              type: 'upload',
              admin: {
                description: ({ t }) => t('website:blocks:Download:file:description'),
                width: '50%',
              },
              relationTo: 'media',
              required: true,
            },
            {
              name: 'thumbnail',
              type: 'upload',
              admin: {
                description: ({ t }) => t('website:blocks:Download:thumbnail:description'),
                width: '50%',
              },
              relationTo: 'media',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'thumbnailAppearance',
              type: 'select',
              admin: {
                width: '50%',
              },
              defaultValue: 'cover',
              options: [
                { label: 'Cover', value: 'cover' },
                { label: 'Contain', value: 'contain' },
              ],
              required: true,
            },
            {
              name: 'background',
              type: 'select',
              admin: {
                width: '50%',
              },
              defaultValue: 'auto',
              options: [
                { label: 'Auto', value: 'auto' },
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ],
              required: true,
            },
          ],
        },
        {
          name: 'copyToClipboard',
          type: 'checkbox',
        },
        {
          name: 'copyToClipboardText',
          type: 'code',
          admin: {
            condition: (_, siblingData) => siblingData.copyToClipboard,
          },
        },
      ],
      label: ({ t }) => t('website:blocks:Download:copyToClipboardText:label'),
      labels: {
        plural: ({ t }) => t('website:blocks:Download:downloadBlock:plural'),
        singular: ({ t }) => t('website:blocks:Download:downloadBlock:singular'),
      },
      minRows: 1,
    },
  ],
  interfaceName: 'DownloadBlockType',
  labels: {
    plural: ({ t }) => t('website:blocks:Download:downloadBlock:plural'),
    singular: ({ t }) => t('website:blocks:Download:downloadBlock:singular'),
  },
}
