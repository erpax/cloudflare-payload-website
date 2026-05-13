#!/usr/bin/env node
/**
 * scripts/extract-codebase-labels.mjs
 *
 * Walks `src/{collections,blocks,globals,fields}/**.{ts,tsx}` and extracts
 * every `label:`, `description:`, and `placeholder:` string assignment in
 * Payload config files. Emits a JSON snippet keyed by `<file>:<line>:<prop>`
 * so each label has a stable id that survives unrelated changes nearby.
 *
 * The output is meant to seed a `website:` translation namespace for the
 * admin UI. Read-only — does not modify source files.
 *
 * Usage:
 *   node scripts/extract-codebase-labels.mjs > labels.json
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src')
const DIRS = ['collections', 'blocks', 'globals', 'fields']
// Pull out `label: 'Foo'` / `description: "Bar"` / `placeholder: 'Baz'`.
// Avoids template strings (would need richer parsing) and lines where the
// value is a function or expression.
const PROP_RE = /^(?<indent>\s*)(?<prop>label|description|placeholder|singular|plural|group)\s*:\s*(['"])(?<value>(?:\\.|(?!\3).)*)\3\s*,?\s*$/

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full, out)
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) {
      out.push(full)
    }
  }
  return out
}

/**
 * Find the parent identifier for a label/description/etc. line.
 *
 * - `singular`, `plural`, `group` live at collection/block-level (inside
 *   `labels: {}` or `admin: {}`), so we look for the nearest `slug:` —
 *   the canonical id of the enclosing collection/block.
 * - Everything else (field labels) is keyed by the nearest `name: '...'`
 *   within 10 lines.
 */
function findParentName(lines, lineIndex, prop) {
  if (prop === 'singular' || prop === 'plural' || prop === 'group') {
    for (let i = lineIndex - 1; i >= 0; i -= 1) {
      const m = lines[i].match(/^\s*slug\s*:\s*['"]([^'"]+)['"]/)
      if (m) return m[1]
    }
    return null
  }
  for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 10); i -= 1) {
    const m = lines[i].match(/^\s*name\s*:\s*['"]([^'"]+)['"]/)
    if (m) return m[1]
  }
  return null
}

const files = []
for (const d of DIRS) {
  const target = path.join(SRC, d)
  try {
    files.push(...walk(target))
  } catch {
    // dir missing — fine
  }
}

const collected = {}
const collisions = {}

for (const file of files) {
  const rel = path.relative(SRC, file).replace(/\\/g, '/')
  const lines = readFileSync(file, 'utf8').split('\n')
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(PROP_RE)
    if (!m) continue
    const { prop, value } = m.groups
    const parentName = findParentName(lines, i, prop)
    const segments = rel.replace(/\.(ts|tsx)$/, '').split('/')
    // Strip noisy filename suffixes like /index → use the directory name.
    if (segments[segments.length - 1] === 'index') segments.pop()
    // Payload's `t()` splits keys by `:` only — use `:` as the path
    // separator so nested-object lookups resolve correctly.
    const key = [...segments, parentName ?? `line${i + 1}`, prop].filter(Boolean).join(':')
    if (collected[key] && collected[key] !== value) {
      collisions[key] = (collisions[key] || [collected[key]]).concat(value)
    }
    collected[key] = value
  }
}

console.log('# extract-codebase-labels\n')
console.log(`Scanned ${files.length} file(s) across ${DIRS.join(', ')}.`)
console.log(`Extracted ${Object.keys(collected).length} string label(s).`)
if (Object.keys(collisions).length > 0) {
  console.log(`! ${Object.keys(collisions).length} key collision(s) detected — review:`)
  for (const [k, v] of Object.entries(collisions)) {
    console.log(`  ${k}: ${JSON.stringify(v)}`)
  }
}
console.log('\n# English snippet (paste into i18n.translations.en.website):\n')
console.log(JSON.stringify(collected, null, 2))
