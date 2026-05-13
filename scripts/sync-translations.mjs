#!/usr/bin/env node
/**
 * scripts/sync-translations.mjs
 *
 * Walks every installed `@payloadcms/plugin-*` package, reads each plugin's
 * shipped translation bundles (`dist/translations/languages/{lang}.js`),
 * and prints a JSON snippet of keys that are present in English but
 * missing for our supported languages — with empty-string placeholders so
 * a translator can fill them in.
 *
 * Read-only by design. The snippet is meant to be pasted into the
 * `i18n.translations` block in `src/payload.config.ts`.
 *
 * Usage:
 *   node scripts/sync-translations.mjs              # default langs: en, bg
 *   node scripts/sync-translations.mjs en bg de     # any subset
 */

import { readdirSync, existsSync, statSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const ROOT = process.cwd()
const PNPM_DIR = path.join(ROOT, 'node_modules/.pnpm')

const argLangs = process.argv.slice(2)
const SUPPORTED = argLangs.length > 0 ? argLangs : ['en', 'bg']
const REFERENCE_LANG = 'en' // assumed to be complete in every plugin bundle

/** Locate every installed @payloadcms/plugin-* package via pnpm's flattened store. */
function findPluginDirs() {
  if (!existsSync(PNPM_DIR)) {
    return []
  }
  const dirs = readdirSync(PNPM_DIR).filter((n) => n.startsWith('@payloadcms+plugin-'))
  return dirs
    .map((d) => {
      const inner = path.join(PNPM_DIR, d, 'node_modules/@payloadcms')
      if (!existsSync(inner)) return null
      const sub = readdirSync(inner).find((n) => n.startsWith('plugin-'))
      return sub ? path.join(inner, sub) : null
    })
    .filter(Boolean)
}

/**
 * Locate the @payloadcms/translations base package — its language bundles
 * cover Payload's core admin UI keys (dateFNSKey, validation messages,
 * dashboard labels, etc.) and are merged before plugin translations.
 * Excluding these from the reference avoids false positives.
 */
function findTranslationsBase() {
  if (!existsSync(PNPM_DIR)) return null
  const match = readdirSync(PNPM_DIR).find((n) => /^@payloadcms\+translations@/.test(n))
  if (!match) return null
  const dir = path.join(PNPM_DIR, match, 'node_modules/@payloadcms/translations')
  return existsSync(dir) ? dir : null
}

async function loadBaseBundle(translationsDir, lang) {
  if (!translationsDir) return null
  const file = path.join(translationsDir, 'dist/languages', `${lang}.js`)
  if (!existsSync(file)) return null
  try {
    const mod = await import(pathToFileURL(file).href)
    const exported = mod[lang] ?? Object.values(mod)[0]
    if (!exported || typeof exported !== 'object') return null
    const ns = { ...exported }
    delete ns.$schema
    delete ns.dateFNSKey // format tokens, not user-translatable
    return ns
  } catch {
    return null
  }
}

/** Dynamically import a single language bundle, returning the namespaced map or null. */
async function loadBundle(pluginDir, lang) {
  const file = path.join(pluginDir, 'dist/translations/languages', `${lang}.js`)
  if (!existsSync(file)) return null
  try {
    const mod = await import(pathToFileURL(file).href)
    // Each file exports `export const <lang> = { ... }`; pick the first
    // namespaced map we find.
    const exported = mod[lang] ?? Object.values(mod)[0]
    if (!exported || typeof exported !== 'object') return null
    const ns = { ...exported }
    delete ns.$schema
    delete ns.dateFNSKey // format tokens, covered by @payloadcms/translations
    return ns
  } catch (err) {
    console.error(`! Failed to load ${file}: ${err.message}`)
    return null
  }
}

/** Deep-walk an object collecting leaf key paths as arrays. */
function collectLeafPaths(obj, prefix = []) {
  const out = []
  for (const [k, v] of Object.entries(obj)) {
    const next = [...prefix, k]
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...collectLeafPaths(v, next))
    } else {
      out.push(next)
    }
  }
  return out
}

/** Set a value at a path inside a nested object (mutates). */
function setAtPath(obj, pathArr, value) {
  let cur = obj
  for (let i = 0; i < pathArr.length - 1; i += 1) {
    const k = pathArr[i]
    if (!cur[k] || typeof cur[k] !== 'object') cur[k] = {}
    cur = cur[k]
  }
  cur[pathArr[pathArr.length - 1]] = value
}

/** Lookup a value at a path, return undefined if any segment missing. */
function getAtPath(obj, pathArr) {
  let cur = obj
  for (const k of pathArr) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[k]
  }
  return cur
}

async function main() {
  const pluginDirs = findPluginDirs()
  const translationsDir = findTranslationsBase()
  if (pluginDirs.length === 0) {
    console.error(`No @payloadcms/plugin-* packages found under ${PNPM_DIR}. Run \`pnpm install\` first.`)
    process.exit(1)
  }

  // Aggregate every plugin's English bundle so we have one map per
  // namespace (e.g. 'plugin-redirects' -> { fromUrl, toUrlType, ... }).
  // Plugin namespaces only — base translations are excluded from the
  // reference so we don't report keys that @payloadcms/translations
  // already covers for the target language.
  const referenceByNs = {}
  for (const dir of pluginDirs) {
    const refBundle = await loadBundle(dir, REFERENCE_LANG)
    if (!refBundle) continue
    for (const [ns, leaves] of Object.entries(refBundle)) {
      referenceByNs[ns] = { ...(referenceByNs[ns] || {}), ...leaves }
    }
  }

  // For each target language compute the gap: keys in the reference that
  // (a) aren't supplied by ANY installed plugin's <lang>.js bundle, and
  // (b) aren't already overridden in our config.
  // We can't see (b) from this script without parsing TS, so we only do
  // (a) — the snippet we emit is "everything you must override yourself".
  const missingByLang = {}
  for (const lang of SUPPORTED) {
    if (lang === REFERENCE_LANG) continue

    // Aggregate plugin-shipped translations for this lang. Include the
    // base @payloadcms/translations bundle so a key delivered there
    // doesn't show up as missing.
    const pluginCoverage = {}
    const baseBundle = await loadBaseBundle(translationsDir, lang)
    if (baseBundle) {
      for (const [ns, leaves] of Object.entries(baseBundle)) {
        pluginCoverage[ns] = { ...(pluginCoverage[ns] || {}), ...leaves }
      }
    }
    for (const dir of pluginDirs) {
      const bundle = await loadBundle(dir, lang)
      if (!bundle) continue
      for (const [ns, leaves] of Object.entries(bundle)) {
        pluginCoverage[ns] = { ...(pluginCoverage[ns] || {}), ...leaves }
      }
    }

    // Diff against the reference.
    const gap = {}
    for (const [ns, refLeaves] of Object.entries(referenceByNs)) {
      const refPaths = collectLeafPaths(refLeaves)
      for (const p of refPaths) {
        const haveValue = getAtPath(pluginCoverage[ns] || {}, p)
        if (typeof haveValue !== 'string' || haveValue.length === 0) {
          if (!gap[ns]) gap[ns] = {}
          // Echo the English value as a hint comment via a sibling key,
          // but keep the actual translation slot empty.
          setAtPath(gap[ns], p, '')
        }
      }
    }

    if (Object.keys(gap).length > 0) {
      missingByLang[lang] = gap
    }
  }

  // Emit summary + paste-ready snippet.
  console.log('# sync-translations\n')
  console.log(
    `Scanned ${pluginDirs.length} plugin package(s). Reference language: ${REFERENCE_LANG}.`,
  )
  console.log(`Target languages: ${SUPPORTED.filter((l) => l !== REFERENCE_LANG).join(', ')}\n`)

  if (Object.keys(missingByLang).length === 0) {
    console.log('No missing translation keys. Every plugin ships bundles for the requested languages.')
    return
  }

  console.log('Paste the snippet below into your `i18n.translations` block in src/payload.config.ts,')
  console.log('then fill in the empty strings:\n')
  console.log(JSON.stringify(missingByLang, null, 2))

  // English hint table — namespace.key = English value — so a translator
  // doesn't have to chase the source bundles.
  console.log('\n# English reference (paste into a translator brief):')
  for (const [lang, nsGap] of Object.entries(missingByLang)) {
    console.log(`\n## ${lang}`)
    for (const [ns, leaves] of Object.entries(nsGap)) {
      const refPaths = collectLeafPaths(leaves)
      for (const p of refPaths) {
        const englishVal = getAtPath(referenceByNs[ns] || {}, p)
        console.log(`${ns}.${p.join('.')} = ${JSON.stringify(englishVal)}`)
      }
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
