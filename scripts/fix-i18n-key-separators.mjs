#!/usr/bin/env node
/**
 * scripts/fix-i18n-key-separators.mjs
 *
 * Payload's `t()` (from @payloadcms/translations) splits keys by `:` only.
 * Dots are treated as part of the key name, not a path separator. My
 * refactor previously emitted dotted paths like
 *
 *   t('website:collections.Foo.bar.label')
 *
 * which tries to look up `translations.website['collections.Foo.bar.label']`
 * — a key that doesn't exist because the JSON is nested. This script
 * rewrites every `t('website:<dotted.path>')` call to use `:` as the path
 * separator instead.
 *
 * Run once after a regression to flat-dotted keys. Idempotent.
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src')
// Refactor target is wider than collections/blocks/globals/fields — any
// file that calls `t('website:...')` is fair game.
const RE = /t\('website:([^']+)'\)/g

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === '.open-next') continue
    const full = path.join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, out)
    else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) out.push(full)
  }
  return out
}

let totalSwaps = 0
let totalFiles = 0
for (const file of walk(SRC)) {
  const content = readFileSync(file, 'utf8')
  let swapsInFile = 0
  const next = content.replace(RE, (_match, body) => {
    if (!body.includes('.')) return `t('website:${body}')`
    swapsInFile += 1
    return `t('website:${body.replace(/\./g, ':')}')`
  })
  if (swapsInFile > 0) {
    writeFileSync(file, next)
    totalSwaps += swapsInFile
    totalFiles += 1
  }
}

console.log(`Swapped . → : in ${totalSwaps} key(s) across ${totalFiles} file(s).`)
