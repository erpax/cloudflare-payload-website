import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/isAdmin'

type FilterLabels = {
  singular: { en: string; bg: string }
  plural: { en: string; bg: string }
}

const Filter: (slug: string, labels: FilterLabels) => CollectionConfig = (slug, labels) => {
  return {
    slug,
    labels,
    access: {
      create: isAdmin,
      delete: isAdmin,
      read: () => true,
      update: isAdmin,
    },
    admin: {
      group: { en: 'Partner Program', bg: 'Партньорска програма' },
      useAsTitle: 'name',
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        label: { en: `${labels.singular.en} Label`, bg: `${labels.singular.bg} — етикет` },
        required: true,
        unique: true,
      },
      {
        name: 'value',
        type: 'text',
        admin: {
          description: ({ t }) => t('website:collections:PartnerFilters:value:description'),
        },
        label: ({ t }) => t('website:collections:PartnerFilters:value:label'),
        required: true,
        unique: true,
      },
    ],
  }
}

export const Specialties = Filter('specialties', {
  singular: { en: 'Specialty', bg: 'Специалност' },
  plural: { en: 'Specialties', bg: 'Специалности' },
})
export const Industries = Filter('industries', {
  singular: { en: 'Industry', bg: 'Индустрия' },
  plural: { en: 'Industries', bg: 'Индустрии' },
})
export const Regions = Filter('regions', {
  singular: { en: 'Region', bg: 'Регион' },
  plural: { en: 'Regions', bg: 'Региони' },
})
export const Budgets = Filter('budgets', {
  singular: { en: 'Budget', bg: 'Бюджет' },
  plural: { en: 'Budgets', bg: 'Бюджети' },
})
