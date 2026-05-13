import { withPayload } from '@payloadcms/next/withPayload'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import path from 'path'
import { fileURLToPath } from 'node:url'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { redirects } from './redirects.js'

import bundleAnalyzer from '@next/bundle-analyzer'

// [cloudflare] Wire Cloudflare bindings (D1/R2/IMAGES/env) into `next dev`
// and the build/SSG phase of `next build` via the wrangler platform proxy.
// No-op in the deployed worker. Canonical per
// https://opennext.js.org/cloudflare/get-started#12-develop-locally
void initOpenNextCloudflareForDev()

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const localhost = process.env.NEXT_PUBLIC_IS_LIVE
  ? []
  : [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: 'local.payloadcms.com',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: 'cms.local.payloadcms.com',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: 'cms.local.payloadcms.com',
        port: '8001',
      },
    ]

const nextConfig = withBundleAnalyzer({
  reactStrictMode: true,
  // [legacy] Skip Next's blocking typecheck during `next build`. The
  // existing payload-types union (`number | T`) trips many pre-existing
  // accesses across (pages); fixing all of them is out of scope for the
  // Cloudflare migration. Run `pnpm tsc --noEmit` separately for IDE/CI.
  typescript: {
    ignoreBuildErrors: true,
  },
  // [cloudflare] Single-worker SSG.
  // `getPlatformProxy({ remoteBindings: true })` boots one Miniflare/workerd
  // instance whose internal SQLite state is shared across Next.js worker
  // processes. Three parallel SSG workers contending on it produces
  // SQLITE_BUSY. Pinning to one worker eliminates the contention. Dev /
  // runtime aren't affected.
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  images: {
    // [cloudflare] Route next/image transforms through Cloudflare Images
    // (Image Resizing on the zone, or Cloudflare Images on the account).
    // The custom loader rewrites src to /cdn-cgi/image/<options>/<src>,
    // which Cloudflare's edge handles natively — no `sharp` (Node-only)
    // is shipped to the worker.
    loader: 'custom',
    loaderFile: './src/utilities/cloudflareImageLoader.ts',
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year,
    qualities: [75, 90],
    remotePatterns: [
      ...localhost,
      {
        protocol: 'https',
        hostname: 'cms.payloadcms.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'cloud-api.payloadcms.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'cms.local.payloadcms.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'stage.cms.payloadcms.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
      },
      // Vercel Blob hostname — only included when BLOB_STORE_ID is set.
      // Next 16 rejects entries with an undefined hostname; drop the whole
      // entry rather than passing through the falsy field.
      ...(process.env.BLOB_STORE_ID
        ? [
            {
              protocol: 'https',
              hostname: process.env.BLOB_STORE_ID,
            },
          ]
        : []),
    ].filter(Boolean),
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api', 'import'], // https://github.com/vercel/next.js/issues/71638
  },
  turbopack: {
    resolveAlias: {
      '@scss': path.resolve(dirname, './src/css/'),
      '@components': path.resolve(dirname, './src/components.js'),
      '@cloud': path.resolve(dirname, './src/app/cloud'),
      '@forms': path.resolve(dirname, './src/forms'),
      '@blocks': path.resolve(dirname, './src/blocks'),
      '@providers': path.resolve(dirname, './src/providers'),
      '@icons': path.resolve(dirname, './src/icons'),
      '@utilities': path.resolve(dirname, './src/utilities'),
      '@types': path.resolve(dirname, './payload-types.ts'),
      '@graphics': path.resolve(dirname, './src/graphics'),
      '@graphql': path.resolve(dirname, './src/graphql'),
    },
  },
  webpack: (config) => {
    const configCopy = { ...config }
    configCopy.resolve = {
      ...config.resolve,
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      extensionAlias: {
        '.js': ['.ts', '.js', '.tsx', '.jsx'],
        '.mjs': ['.mts', '.mjs'],
      },
      alias: {
        ...config.resolve.alias,
        '@scss': path.resolve(dirname, './src/css/'),
        '@components': path.resolve(dirname, './src/components.js'),
        '@cloud': path.resolve(dirname, './src/app/cloud'),
        '@forms': path.resolve(dirname, './src/forms'),
        '@blocks': path.resolve(dirname, './src/blocks'),
        '@providers': path.resolve(dirname, './src/providers'),
        '@icons': path.resolve(dirname, './src/icons'),
        '@utilities': path.resolve(dirname, './src/utilities'),
        '@types': path.resolve(dirname, './payload-types.ts'),
        '@graphics': path.resolve(dirname, './src/graphics'),
        '@graphql': path.resolve(dirname, './src/graphql'),
      },
    }
    return configCopy
  },
  redirects,
  async headers() {
    const headers = [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "object-src 'none';base-uri 'self';form-action 'self';",
          },
        ],
      },
    ]

    if (!process.env.NEXT_PUBLIC_IS_LIVE) {
      headers.push({
        source: '/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      })
    }
    return headers
  },
})

export default withPayload(nextConfig, { devBundleServerPackages: false })
