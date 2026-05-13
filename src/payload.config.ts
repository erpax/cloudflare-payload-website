import { revalidateRedirects } from '@hooks/revalidateRedirects'
import { type CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { sentryPlugin } from '@payloadcms/plugin-sentry'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { bg } from '@payloadcms/translations/languages/bg'
import { en } from '@payloadcms/translations/languages/en'
import websiteI18n from './i18n/website.json'
import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  lexicalEditor,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import { r2Storage } from '@payloadcms/storage-r2'
import link from '@root/fields/link'
import { LabelFeature } from '@root/fields/richText/features/label/server'
import { LargeBodyFeature } from '@root/fields/richText/features/largeBody/server'
import { cloudflareEmailAdapter } from '@root/lib/cloudflareEmailAdapter'
import { verifyTurnstile } from '@root/lib/turnstile'
import { withShortEnums } from '@root/utilities/shortEnumName'
import { revalidateTag } from 'next/cache'
import path from 'path'
import { buildConfig, type TextField } from 'payload'
import { fileURLToPath } from 'url'
import type { GetPlatformProxyOptions } from 'wrangler'

import { BlogContent } from './blocks/BlogContent'
import { BlogMarkdown } from './blocks/BlogMarkdown'
import { Callout } from './blocks/Callout'
import { CallToAction } from './blocks/CallToAction'
import { CardGrid } from './blocks/CardGrid'
import { CaseStudiesHighlight } from './blocks/CaseStudiesHighlight'
import { CaseStudyCards } from './blocks/CaseStudyCards'
import { CaseStudyParallax } from './blocks/CaseStudyParallax'
import { Code } from './blocks/Code'
import { CodeFeature } from './blocks/CodeFeature'
import { ComparisonTable } from './blocks/ComparisonTable'
import { Content } from './blocks/Content'
import { ContentGrid } from './blocks/ContentGrid'
import { DownloadBlock } from './blocks/Download'
import { CodeExampleBlock, ExampleTabs, MediaExampleBlock } from './blocks/ExampleTabs'
import { Form } from './blocks/Form'
import { HoverCards } from './blocks/HoverCards'
import { HoverHighlights } from './blocks/HoverHighlights'
import { LinkGrid } from './blocks/LinkGrid'
import { LogoGrid } from './blocks/LogoGrid'
import { MediaBlock } from './blocks/Media'
import { MediaContent } from './blocks/MediaContent'
import { MediaContentAccordion } from './blocks/MediaContentAccordion'
import { Pricing } from './blocks/Pricing'
import { ReusableContent as ReusableContentBlock } from './blocks/ReusableContent'
import { Slider } from './blocks/Slider'
import { Statement } from './blocks/Statement'
import { Steps } from './blocks/Steps'
import { StickyHighlights } from './blocks/StickyHighlights'
import { CaseStudies } from './collections/CaseStudies'
import { Categories } from './collections/Categories'
import { CommunityHelp } from './collections/CommunityHelp'
import { Docs } from './collections/Docs'
import { ArrowBlock } from './collections/Docs/blocks/arrow'
import { BannerBlock } from './collections/Docs/blocks/banner'
import { BulletListBlock } from './collections/Docs/blocks/bulletList'
import { CodeBlock } from './collections/Docs/blocks/code'
import { LightDarkImageBlock } from './collections/Docs/blocks/lightDarkImage'
import { PayloadMediaBlock } from './collections/Docs/blocks/payloadMedia'
import { PillBlock } from './collections/Docs/blocks/pill'
import { ResourceBlock } from './collections/Docs/blocks/resource'
import { RestExamplesBlock } from './collections/Docs/blocks/restExamples'
import { TableWithDrawersBlock } from './collections/Docs/blocks/tableWithDrawers'
import { UploadBlock } from './collections/Docs/blocks/upload'
import { VideoDrawerBlock } from './collections/Docs/blocks/VideoDrawer'
import { YoutubeBlock } from './collections/Docs/blocks/youtube'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Budgets, Industries, Regions, Specialties } from './collections/PartnerFilters'
import { Partners } from './collections/Partners'
import { Posts } from './collections/Posts'
import { ReusableContent } from './collections/ReusableContent'
import { Users } from './collections/Users'
import { Footer } from './globals/Footer'
import { GetStarted } from './globals/GetStarted'
import { MainMenu } from './globals/MainMenu'
import { PartnerProgram } from './globals/PartnerProgram'
import { TopBar } from './globals/TopBar'
import { opsCounterPlugin } from './plugins/opsCounter'
import createReleasePost from './scripts/createReleasePost'
import createReleasePostFromAdmin from './scripts/createReleasePostFromAdmin'
import redeployWebsite from './scripts/redeployWebsite'
import { refreshMdxToLexical, syncDocs } from './scripts/syncDocs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// [cloudflare] Pick the right way to obtain the Cloudflare context per phase.
// CLI invocations (payload generate:* / migrate*) go through wrangler's
// `getPlatformProxy` so D1/R2/IMAGES are usable from Node. Everything else
// (next dev/build/SSG, the deployed worker) goes through OpenNext's helper,
// which resolves either the live worker env (runtime) or a local wrangler
// proxy (build/SSG). Matches templates/with-cloudflare-d1.
const cloudflare = process.argv.find((value) => /^(generate|migrate):?/.test(value))
  ? await getCloudflareContextFromWrangler()
  : await getCloudflareContext({ async: true })

export default buildConfig(withShortEnums({
  admin: {
    autoLogin: {
      email: 'dev2@payloadcms.com',
      password: 'test',
    },
    components: {
      afterNavLinks: ['@root/components/AfterNavActions'],
      beforeDashboard: ['@root/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: dirname,
    },
  },
  blocks: [
    BlogContent,
    BlogMarkdown,
    CodeExampleBlock,
    MediaExampleBlock,
    Callout,
    CallToAction,
    DownloadBlock,
    LightDarkImageBlock,
    PayloadMediaBlock,
    TableWithDrawersBlock,
    YoutubeBlock,
    PillBlock,
    ArrowBlock,
    BulletListBlock,
    CardGrid,
    CaseStudyCards,
    CaseStudiesHighlight,
    UploadBlock,
    CaseStudyParallax,
    CodeFeature,
    Content,
    ContentGrid,
    ComparisonTable,
    Form,
    HoverCards,
    HoverHighlights,
    LinkGrid,
    LogoGrid,
    MediaBlock,
    MediaContent,
    MediaContentAccordion,
    RestExamplesBlock,
    Pricing,
    ReusableContentBlock,
    ResourceBlock,
    Slider,
    Statement,
    Steps,
    StickyHighlights,
    ExampleTabs,
    {
      slug: 'spotlight',
      fields: [
        {
          name: 'element',
          type: 'select',
          options: [
            {
              label: 'H1',
              value: 'h1',
            },
            {
              label: 'H2',
              value: 'h2',
            },
            {
              label: 'H3',
              value: 'h3',
            },
            {
              label: 'Paragraph',
              value: 'p',
            },
          ],
        },
        {
          name: 'richText',
          type: 'richText',
          editor: lexicalEditor(),
        },
      ],
      interfaceName: 'SpotlightBlock',
    },
    {
      slug: 'video',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
      interfaceName: 'VideoBlock',
    },
    {
      slug: 'br',
      fields: [
        {
          name: 'ignore',
          type: 'text',
        },
      ],

      interfaceName: 'BrBlock',
    },
    VideoDrawerBlock,
    {
      slug: 'commandLine',
      fields: [
        {
          name: 'command',
          type: 'text',
        },
      ],
      interfaceName: 'CommandLineBlock',
    },
    {
      slug: 'command',
      fields: [
        {
          name: 'command',
          type: 'text',
          required: true,
        },
      ],
      labels: {
        plural: 'Command Lines',
        singular: 'Command Line',
      },
    },
    {
      slug: 'link',
      fields: [link()],
      labels: {
        plural: 'Links',
        singular: 'Link',
      },
    },
    {
      slug: 'templateCards',
      fields: [
        {
          name: 'templates',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
            },
            {
              name: 'image',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
            },
            {
              name: 'order',
              type: 'number',
              required: true,
            },
          ],
          labels: {
            plural: 'Templates',
            singular: 'Template',
          },
        },
      ],
      interfaceName: 'TemplateCardsBlock',
    },
    BannerBlock,
    CodeBlock,
    Code,
  ],
  collections: [
    CaseStudies,
    CommunityHelp,
    Docs,
    Media,
    Pages,
    Posts,
    Categories,
    ReusableContent,
    Users,
    Partners,
    Industries,
    Specialties,
    Regions,
    Budgets,
  ],
  cors: [
    process.env.PAYLOAD_PUBLIC_APP_URL || '',
    'https://payloadcms.com',
    'https://discord.com/api',
  ].filter(Boolean),
  // [cloudflare] D1 SQLite via the Cloudflare binding. Non-null assertion
  // because wrangler's generated types mark D1 optional until wrangler.jsonc
  // has a real `database_id`; at runtime the worker always has the binding.
  db: sqliteD1Adapter({ binding: cloudflare.env.D1! }),
  defaultDepth: 1,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((feature) => feature.key !== 'link'),
      LinkFeature({
        fields({ defaultFields }) {
          return [
            ...defaultFields.filter((field) => field.name !== 'url'),
            {
              // Own url field to disable URL encoding links starting with '../'
              name: 'url',
              type: 'text',
              label: ({ t }) => t('fields:enterURL'),
              required: true,
              validate: (value: string, options) => {
                return
              },
            } as TextField,
          ]
        },
      }),
      EXPERIMENTAL_TableFeature(),
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: 'enableLink',
                type: 'checkbox',
                label: 'Enable Link',
              },
              link({
                appearances: false,
                disableLabel: true,
                overrides: {
                  admin: {
                    condition: (_, data) => Boolean(data?.enableLink),
                  },
                },
              }),
            ],
          },
        },
      }),
      LabelFeature(),
      LargeBodyFeature(),
      BlocksFeature({
        blocks: [
          'spotlight',
          'video',
          'br',
          'Banner',
          'VideoDrawer',
          'templateCards',
          'Code',
          'downloadBlock',
          'commandLine',
        ],
      }),
    ],
  }),
  // [cloudflare] Cloudflare Email Workers `send_email` binding. Each
  // destination address must be verified in the Cloudflare dashboard
  // (Email > Email Routing > Destination addresses) before delivery
  // succeeds. Replaces the Resend HTTP transport.
  email: cloudflareEmailAdapter({
    // SEND_EMAIL is typed as workers-types `SendEmail` (with EmailMessage
    // class shapes) — our adapter only relies on `.send(...)`, so cast to
    // its narrower local interface.
    binding: cloudflare.env.SEND_EMAIL as unknown as Parameters<
      typeof cloudflareEmailAdapter
    >[0]['binding'],
    defaultFromAddress: process.env.MAIL_FROM_ADDRESS || 'info@payloadcms.com',
    defaultFromName: process.env.MAIL_FROM_NAME || 'Payload',
  }),
  endpoints: [
    {
      handler: syncDocs,
      method: 'get',
      path: '/sync/docs',
    },
    {
      handler: redeployWebsite,
      method: 'post',
      path: '/redeploy/website',
    },
    {
      handler: refreshMdxToLexical,
      method: 'get',
      path: '/refresh/mdx-to-lexical',
    },
    {
      handler: createReleasePost,
      method: 'post',
      path: '/create-release-post',
    },
    {
      handler: createReleasePostFromAdmin,
      method: 'post',
      path: '/create-release-post-from-admin',
    },
  ],
  globals: [Footer, MainMenu, GetStarted, PartnerProgram, TopBar],
  graphQL: {
    disablePlaygroundInProduction: false,
  },
  // Opt out of Payload's anonymous usage telemetry. Mirrored by the
  // PAYLOAD_DISABLE_TELEMETRY env var (set in wrangler.jsonc vars).
  telemetry: false,
  // Admin UI locales + plugin-namespace overrides. To discover missing
  // translation keys for any installed plugin, run
  // `pnpm sync-translations` — it prints empty-string stubs for any key a
  // plugin defines in English but doesn't ship in our supported locales.
  // Paste the stubs into this `translations` block and fill them in.
  i18n: {
    supportedLanguages: { en, bg },
    translations: {
      en: {
        'plugin-redirects': {
          customUrl: 'Custom URL',
          documentToRedirect: 'Document to Redirect',
          fromUrl: 'From URL',
          internalLink: 'Internal Link',
          redirectType: 'Redirect Type',
          toUrlType: 'To URL Type',
        },
        // 190 admin-side labels extracted from collections/blocks/globals/fields
        // by `scripts/extract-codebase-labels.mjs`. Reference these via
        // `t('website:<dotted:path>')` once you refactor the callsites.
        website: websiteI18n.en,
      },
      bg: {
        'plugin-redirects': {
          customUrl: 'Персонализиран URL',
          documentToRedirect: 'Документ за пренасочване',
          fromUrl: 'Изходен URL',
          internalLink: 'Вътрешна връзка',
          redirectType: 'Тип на пренасочване',
          toUrlType: 'Тип на целевия URL',
        },
        website: websiteI18n.bg,
      },
    },
  },
  plugins: [
    opsCounterPlugin({
      max: 200,
      warnAt: 25,
    }),
    formBuilderPlugin({
      formOverrides: {
        labels: {
          singular: { en: 'Form', bg: 'Форма' },
          plural: { en: 'Forms', bg: 'Форми' },
        },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'hubSpotFormID',
            type: 'text',
            admin: {
              position: 'sidebar',
            },
            label: { en: 'HubSpot Form ID', bg: 'HubSpot ID на форма' },
          },
          {
            name: 'customID',
            type: 'text',
            admin: {
              description: {
                en: 'Attached to submission button to track clicks',
                bg: 'Прикачен към бутона за изпращане за проследяване на кликове',
              },
              position: 'sidebar',
            },
            label: { en: 'Custom ID', bg: 'Персонализиран ID' },
          },
          {
            name: 'requireRecaptcha',
            type: 'checkbox',
            admin: {
              position: 'sidebar',
              description: {
                en: 'Require a Cloudflare Turnstile challenge on this form. (Field name kept for migration compatibility.)',
                bg: 'Изисквай Cloudflare Turnstile проверка на тази форма. (Името на полето е запазено за съвместимост.)',
              },
            },
            label: { en: 'Require Turnstile', bg: 'Изисквай Turnstile' },
          },
        ],
        hooks: {
          afterChange: [
            ({ doc }) => {
              revalidateTag(`form-${doc.title}`, 'max')
            },
          ],
        },
      },
      formSubmissionOverrides: {
        labels: {
          singular: { en: 'Form Submission', bg: 'Изпращане на форма' },
          plural: { en: 'Form Submissions', bg: 'Изпращания на форми' },
        },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'recaptcha',
            type: 'text',
            admin: {
              description:
                'Cloudflare Turnstile token. Field name kept for migration compatibility.',
            },
            validate: async (value, { req, siblingData }) => {
              const form = await req.payload.findByID({
                id: siblingData?.form,
                collection: 'forms',
              })

              if (!form?.requireRecaptcha) {
                return true
              }

              if (!value) {
                return 'Please complete the Turnstile challenge'
              }

              const remoteip =
                req?.headers?.get?.('cf-connecting-ip') ??
                req?.headers?.get?.('x-forwarded-for') ??
                undefined

              const ok = await verifyTurnstile({
                token: String(value),
                remoteip: remoteip ?? undefined,
                secret: process.env.TURNSTILE_SECRET_KEY ?? '',
              })

              return ok ? true : 'Invalid Turnstile token'
            },
          },
        ],
        hooks: {
          afterChange: [
            async ({ doc, req }) => {
              req.payload.logger.info('Form Submission Received')
              req.payload.logger.info(Object.fromEntries(req?.headers.entries()))

              const body = req.json ? await req.json() : {}

              const sendSubmissionToHubSpot = async (): Promise<void> => {
                const { form, submissionData: submissionDataFromDoc } = doc
                const portalID = process.env.NEXT_PRIVATE_HUBSPOT_PORTAL_KEY

                // Remove partnerId from HubSpot submission (toEmail already populated by beforeChange hook)
                const submissionData = submissionDataFromDoc.filter(
                  (field) => field.field !== 'partnerId',
                )

                const data = {
                  context: {
                    ...('hubspotCookie' in body && { hutk: body?.hubspotCookie }),
                    pageName: 'pageName' in body ? body?.pageName : '',
                    pageUri: 'pageUri' in body ? body?.pageUri : '',
                  },
                  fields: submissionData.map((key) => ({
                    name: key.field,
                    value: key.value,
                  })),
                }

                try {
                  await fetch(
                    `https://api.hsforms.com/submissions/v3/integration/submit/${portalID}/${form.hubSpotFormID}`,
                    {
                      body: JSON.stringify(data),
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      method: 'POST',
                    },
                  )
                } catch (err: unknown) {
                  req.payload.logger.error({
                    err,
                    msg: 'Fetch to HubSpot form submissions failed',
                  })
                }
              }
              await sendSubmissionToHubSpot()
            },
          ],
          beforeChange: [
            async ({ data, req }) => {
              // Look up partner email if partnerId is present and populate toEmail field
              // This runs before email notifications are sent
              const partnerIdField = data?.submissionData?.find(
                (field) => field.field === 'partnerId',
              )

              if (partnerIdField?.value) {
                try {
                  const partner = await req.payload.findByID({
                    id: partnerIdField.value,
                    collection: 'partners',
                    overrideAccess: true,
                  })

                  if (partner?.email) {
                    // Add toEmail field to submissionData for email notifications
                    data.submissionData.push({
                      field: 'toEmail',
                      value: partner.email,
                    })
                  }
                } catch (err) {
                  req.payload.logger.error({
                    err,
                    msg: 'Failed to lookup partner email',
                  })
                }
              }

              return data
            },
          ],
        },
      },
    }),
    seoPlugin({
      collections: ['case-studies', 'pages', 'posts'],
      globals: ['get-started'],
      uploadsCollection: 'media',
    }),
    nestedDocsPlugin({
      collections: ['pages'],
      generateLabel: (_, doc) => doc.title as string,
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug as string}`, ''),
    }),
    redirectsPlugin({
      collections: ['case-studies', 'pages', 'posts'],
      overrides: {
        labels: {
          singular: { en: 'Redirect', bg: 'Пренасочване' },
          plural: { en: 'Redirects', bg: 'Пренасочвания' },
        },
        hooks: {
          afterChange: [revalidateRedirects],
        },
      },
    }),
    // First-party Payload search plugin — replaces Algolia. Mirrors each
    // listed collection into a generated `search` collection via
    // beforeChange/afterDelete hooks. Query via Payload's local/REST API:
    //   GET /api/search?where[doc.relationTo][equals]=docs&where[title][like]=...
    searchPlugin({
      collections: ['community-help', 'docs', 'posts'],
      defaultPriorities: {
        docs: 30,
        posts: 20,
        'community-help': 10,
      },
      searchOverrides: {
        labels: {
          singular: { en: 'Search Result', bg: 'Резултат от търсене' },
          plural: { en: 'Search Results', bg: 'Резултати от търсене' },
        },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'platform',
            type: 'text',
            admin: { description: { en: 'discord | github | docs | posts', bg: 'discord | github | docs | posts' } },
          },
          {
            name: 'helpful',
            type: 'checkbox',
            defaultValue: true,
            label: { en: 'Helpful', bg: 'Полезно' },
          },
          {
            name: 'author',
            type: 'text',
            label: { en: 'Author', bg: 'Автор' },
          },
          {
            name: 'excerpt',
            type: 'textarea',
            label: { en: 'Excerpt', bg: 'Откъс' },
          },
        ],
      },
      beforeSync: ({ originalDoc, searchDoc }) => {
        // Carry over community-help-specific fields so the search row
        // remains filterable on `helpful` + `platform`.
        const helpful = (originalDoc as { helpful?: boolean }).helpful
        const communityHelpType = (originalDoc as { communityHelpType?: string }).communityHelpType
        const json = (originalDoc as { communityHelpJSON?: any }).communityHelpJSON
        return {
          ...searchDoc,
          helpful: typeof helpful === 'boolean' ? helpful : true,
          platform: communityHelpType ?? 'docs',
          author:
            json?.intro?.authorName ?? json?.author?.name ?? (originalDoc as any)?.author?.name ?? '',
          excerpt:
            json?.intro?.content ??
            json?.body ??
            (originalDoc as any)?.introDescription ??
            (originalDoc as any)?.excerpt ??
            '',
        }
      },
    }),
    // Import/export — adds admin-side buttons that emit CSV/JSON of
    // collection docs (and bulk-import in the same format). Streams the
    // download response, so it works fine on workerd without local fs.
    importExportPlugin({
      collections: [
        'case-studies',
        'community-help',
        'docs',
        'pages',
        'partners',
        'posts',
      ],
      overrideExportCollection: ({ collection }) => ({
        ...collection,
        labels: {
          singular: { en: 'Export', bg: 'Експорт' },
          plural: { en: 'Exports', bg: 'Експорти' },
        },
      }),
      overrideImportCollection: ({ collection }) => ({
        ...collection,
        labels: {
          singular: { en: 'Import', bg: 'Импорт' },
          plural: { en: 'Imports', bg: 'Импорти' },
        },
      }),
    }),
    // MCP server endpoint — exposes the Payload local API to MCP clients
    // (Claude Code, IDE agents). Mounts at /api/mcp under the worker.
    mcpPlugin({
      overrideApiKeyCollection: (collection) => ({
        ...collection,
        labels: {
          singular: { en: 'API Key', bg: 'API ключ' },
          plural: { en: 'API Keys', bg: 'API ключове' },
        },
        admin: {
          ...(collection.admin ?? {}),
          group: { en: 'MCP', bg: 'MCP' },
        },
      }),
    }),
    // Sentry error monitoring — opt-in: the plugin no-ops when SENTRY_DSN
    // is unset, so adding it here doesn't break local dev.
    ...(process.env.SENTRY_DSN
      ? [sentryPlugin({ Sentry: { dsn: process.env.SENTRY_DSN } as any })]
      : []),
    // [cloudflare] R2 storage for media uploads (replaces Vercel Blob).
    // Public read URLs require either Cloudflare R2's public bucket setting
    // or a Worker route that fetches from the bucket; configure on the R2
    // bucket in the Cloudflare dashboard. Non-null assertion mirrors D1.
    r2Storage({
      bucket: cloudflare.env.R2!,
      collections: { media: true },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
}))

// [cloudflare] Wrangler-proxy helper for `payload migrate`/`generate:*` CLI
// runs. Mirrors templates/with-cloudflare-d1/src/payload.config.ts.
// `remoteBindings: NODE_ENV === 'production'` routes the CLI to remote D1 in
// CI / `pnpm deploy:database`, and to local Miniflare D1 in dev.
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: process.env.NODE_ENV === 'production',
      } satisfies GetPlatformProxyOptions),
  )
}
