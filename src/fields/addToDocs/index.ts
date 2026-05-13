import type { Field } from 'payload'

export const addToDocs: Field = {
  name: 'addToDocs',
  type: 'text',
  admin: {
    components: {
      Label: '@root/fields/addToDocs/Label#Label',
    },
    description: ({ t }) => t('website:fields:addToDocs:addToDocs:description'),
    position: 'sidebar',
  },
  hooks: {
    beforeChange: [
      ({ originalDoc }) => {
        return `<Resource id="${originalDoc?.id}" />`
      },
    ],
  },
}
