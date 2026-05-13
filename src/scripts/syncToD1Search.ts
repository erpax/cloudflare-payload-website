/**
 * Re-indexes community-help threads into the plugin-search `search`
 * collection. With plugin-search wired up, ordinary `payload.update` calls
 * on the source collections (docs / posts / community-help) fan out via
 * beforeChange hooks automatically — so this script only needs to "touch"
 * each row to force a re-sync.
 */

import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const syncToD1Search = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'community-help',
    depth: 0,
    limit: 0,
    pagination: false,
  })

  for (const doc of result.docs as Array<{ id: string | number }>) {
    try {
      await payload.update({
        collection: 'community-help',
        id: doc.id,
        // No data change — plugin-search's beforeChange hook still fires
        // and upserts a fresh row in `search`.
        data: {},
      })
    } catch (err) {
      payload.logger?.error({ err, id: doc.id, msg: '[syncToD1Search] reindex failed' })
    }
  }
}

export default syncToD1Search
