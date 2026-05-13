import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// [cloudflare] Canonical OpenNext config. `opennextjs-cloudflare build`
// invokes `npm run build` (= `pnpm payload migrate && next build`) and then
// bundles `.next/` into `.open-next/worker.js`. Add overrides for R2/DO/D1
// caching here if you turn those on later — see:
// https://opennext.js.org/cloudflare/get-started
export default defineCloudflareConfig({})
