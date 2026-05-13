import type { Block } from 'payload'

export const PillBlock: Block = {
  slug: 'Pill',
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
      label: ({ t }) => t('website:collections:Docs:blocks:pill:text:label'),
      admin: {
        description: ({ t }) => t('website:collections:Docs:blocks:pill:text:description'),
      },
    },
  ],
  interfaceName: 'PillBlock',
  jsx: {
    export: ({ fields }) => {
      return {
        props: {
          text: fields.text,
        },
      }
    },
    import: ({ props }) => {
      return {
        text: props.text,
      }
    },
  },
}
