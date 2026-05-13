/**
 * @payloadcms/drizzle bails when a generated table/enum identifier exceeds
 * 63 characters. Long collection slugs combined with deeply-nested block
 * field paths (e.g. `enum_case_studies_blocks_callout_callout_fields_settings_background`)
 * routinely cross that line.
 *
 * `shortEnumName` is a deterministic, collision-resistant shortener:
 *
 *   - Returns the original name unchanged when it already fits.
 *   - When too long, keeps a meaningful prefix and appends a short hash
 *     derived from the FULL original name, so two long names that share a
 *     prefix still collapse to distinct shortened identifiers.
 *
 * The hash is a tiny djb2 variant rendered in base36 — no crypto needed,
 * and it works inside workerd, Node, and the Payload CLI without a `crypto`
 * import.
 *
 * Wire it via the `dbName` / `enumName` callbacks supported by Payload
 * select / array / has-many fields:
 *
 *   {
 *     name: 'background',
 *     type: 'select',
 *     enumName: ({ tableName }) => shortEnumName(`enum_${tableName}_background`),
 *     options: [...]
 *   }
 */

const MAX_IDENTIFIER_LENGTH = 63

// 8-char base36 hash is ~41 bits of entropy — collision-safe in the size of
// a single Payload schema while keeping the budget for a readable prefix.
const HASH_LENGTH = 8
const SEPARATOR = '_'

const hash = (input: string): string => {
  // djb2: h = 33 * h ^ c, seeded at 5381. Wrapped to 32 bits via `| 0`.
  let h = 5381
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33) ^ input.charCodeAt(i)
  }
  // `>>> 0` reinterprets as unsigned 32-bit, then base36 keeps it short.
  return (h >>> 0).toString(36).padStart(HASH_LENGTH, '0').slice(0, HASH_LENGTH)
}

/**
 * Cloudflare D1 / workerd reserve the `_cf_*` table-name prefix
 * (SQLITE_AUTH). Payload prepends `_` to version tables, so any custom
 * `dbName` that starts with `cf` (case-insensitive) ends up colliding.
 * We rewrite the leading letters out of harm's way.
 */
const RESERVED_PREFIX_RE = /^cf/i
const RESERVED_PREFIX_REPLACEMENT = 'x'

const avoidReservedPrefix = (name: string): string =>
  RESERVED_PREFIX_RE.test(name)
    ? `${RESERVED_PREFIX_REPLACEMENT}${name.replace(RESERVED_PREFIX_RE, '')}`
    : name

export const shortEnumName = (name: string, max: number = MAX_IDENTIFIER_LENGTH): string => {
  const safe = avoidReservedPrefix(name)
  if (safe.length <= max) {
    return safe
  }
  const budget = max - HASH_LENGTH - SEPARATOR.length
  const prefix = safe.slice(0, Math.max(budget, 0))
  return `${prefix}${SEPARATOR}${hash(name)}`
}

// ---------------------------------------------------------------------------
// Bulk application across an entire Payload field tree.
//
// `injectShortEnumNames` walks any Field[] (collection fields, global
// fields, block fields, nested groups/arrays/tabs/rows/collapsibles) and
// attaches an `enumName` callback to every select / radio field that does
// not already define one. The callback runs at schema-build time with the
// parent `tableName` and produces a ≤63-char identifier.
//
// `enumName` overrides `dbName` for enum naming in @payloadcms/drizzle, so
// pre-existing `dbName` values on selects (rare in this codebase) are not
// disturbed.
// ---------------------------------------------------------------------------

type AnyField = Record<string, unknown> & { type: string; name?: string }

const isFieldWithOptions = (field: AnyField): boolean =>
  (field.type === 'select' || field.type === 'radio') &&
  Array.isArray(field.options) &&
  field.options.length > 0

const ensureEnumName = (field: AnyField): void => {
  if (typeof field.enumName !== 'undefined') {
    return
  }
  const fieldName = typeof field.name === 'string' ? field.name : 'enum'
  field.enumName = ({ tableName }: { tableName: string }) =>
    shortEnumName(`enum_${tableName}_${fieldName}`)
}

/**
 * Convenience helper for a full Payload `buildConfig` argument. Walks
 * `blocks`, `collections`, and `globals` and applies `injectShortEnumNames`
 * to each one's field tree. Returns the same object back so it composes
 * with `buildConfig({...})`:
 *
 *   export default buildConfig(withShortEnums({ blocks, collections, ... }))
 */
export const withShortEnums = <T extends Record<string, unknown>>(config: T): T => {
  const c = config as {
    blocks?: Array<{ fields?: unknown }>
    collections?: Array<{ fields?: unknown }>
    globals?: Array<{ fields?: unknown }>
  }
  if (Array.isArray(c.blocks)) {
    for (const block of c.blocks) {
      injectShortEnumNames(block?.fields)
    }
  }
  if (Array.isArray(c.collections)) {
    for (const collection of c.collections) {
      injectShortEnumNames(collection?.fields)
    }
  }
  if (Array.isArray(c.globals)) {
    for (const global of c.globals) {
      injectShortEnumNames(global?.fields)
    }
  }
  return config
}

/**
 * Sanitise an explicit string `dbName` on any field: enforce the 63-char
 * limit and avoid the workerd-reserved `_cf_` prefix. Function-form
 * `dbName` callbacks are left alone — the caller is presumed to know what
 * they're doing.
 */
const sanitizeDbName = (field: AnyField): void => {
  const current = field.dbName
  if (typeof current !== 'string' || current.length === 0) {
    return
  }
  const safe = shortEnumName(current)
  if (safe !== current) {
    field.dbName = safe
  }
}

export const injectShortEnumNames = (fields: unknown): void => {
  if (!Array.isArray(fields)) {
    return
  }
  for (const raw of fields) {
    const field = raw as AnyField
    if (!field || typeof field !== 'object') {
      continue
    }

    sanitizeDbName(field)

    if (isFieldWithOptions(field)) {
      ensureEnumName(field)
      continue
    }

    // Container fields — recurse into their children. Field kinds with
    // `fields`: group, array, row, collapsible, ui (rare), unnamed wrappers.
    const maybeFields = (field as unknown as { fields?: unknown }).fields
    if (Array.isArray(maybeFields)) {
      injectShortEnumNames(maybeFields)
    }

    // `tabs` is `{ tabs: [{ fields: [...] }] }`.
    if (field.type === 'tabs') {
      const tabs = (field as unknown as { tabs?: unknown }).tabs
      if (Array.isArray(tabs)) {
        for (const tab of tabs as Array<{ fields?: unknown }>) {
          if (tab && Array.isArray(tab.fields)) {
            injectShortEnumNames(tab.fields)
          }
        }
      }
    }

    // `blocks` field — each block has its own `fields[]`.
    if (field.type === 'blocks') {
      const blocks = (field as unknown as { blocks?: unknown }).blocks
      if (Array.isArray(blocks)) {
        for (const block of blocks as Array<{ fields?: unknown }>) {
          if (block && Array.isArray(block.fields)) {
            injectShortEnumNames(block.fields)
          }
        }
      }
    }
  }
}
