#!/usr/bin/env node
/**
 * scripts/refactor-labels-to-i18n.mjs
 *
 * In-place rewrite of every `label|description|placeholder: 'string'`
 * assignment under `src/{collections,blocks,globals,fields}/**.{ts,tsx}`
 * into the Payload i18n function form:
 *
 *   from: label: 'From URL',
 *     to: label: ({ t }) => t('website:collections.Foo.from.label'),
 *
 * The key-derivation logic is the SAME as
 * `scripts/extract-codebase-labels.mjs`, so the generated keys are
 * identical to those already in `src/i18n/website.json`. Idempotent:
 * already-refactored lines (function form) are skipped.
 *
 * Pass `--dry` to preview without writing.
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC = path.join(ROOT, 'src')
const DIRS = ['collections', 'blocks', 'globals', 'fields']
const DRY = process.argv.includes('--dry')

// `placeholder` and `group` are admin props serialised straight to client
// components — they cannot accept a LabelFunction without tripping Next's
// "Functions cannot be passed directly to Client Components" runtime error.
// Keep them as plain string literals.
const PROP_RE = /^(?<indent>\s*)(?<prop>label|description|singular|plural)\s*:\s*(['"])(?<value>(?:\\.|(?!\3).)*)\3\s*,?\s*$/

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, out)
    else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) out.push(full)
  }
  return out
}

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

let totalFiles = 0
let totalRewrites = 0
const filesTouched = []

for (const d of DIRS) {
  let files
  try {
    files = walk(path.join(SRC, d))
  } catch {
    continue
  }

  for (const file of files) {
    totalFiles += 1
    const rel = path.relative(SRC, file).replace(/\\/g, '/')
    const lines = readFileSync(file, 'utf8').split('\n')
    let mutated = false
    let rewritesInFile = 0

    for (let i = 0; i < lines.length; i += 1) {
      const m = lines[i].match(PROP_RE)
      if (!m) continue
      const { indent, prop } = m.groups
      const parentName = findParentName(lines, i, prop)
      const segments = rel.replace(/\.(ts|tsx)$/, '').split('/')
      if (segments[segments.length - 1] === 'index') segments.pop()
      const key = [...segments, parentName ?? `line${i + 1}`, prop].filter(Boolean).join(':')
      const replacement = `${indent}${prop}: ({ t }) => t('website:${key}'),`
      lines[i] = replacement
      mutated = true
      rewritesInFile += 1
    }

    if (mutated) {
      if (!DRY) writeFileSync(file, lines.join('\n'))
      filesTouched.push({ file: rel, rewrites: rewritesInFile })
      totalRewrites += rewritesInFile
    }
  }
}

console.log('# refactor-labels-to-i18n')
console.log(DRY ? '(dry run — no files written)\n' : '')
console.log(`Scanned ${totalFiles} file(s).`)
console.log(`Rewrote ${totalRewrites} label(s) across ${filesTouched.length} file(s).`)
if (filesTouched.length > 0) {
  console.log('\n## Touched files:')
  for (const { file, rewrites } of filesTouched) {
    console.log(`  ${rewrites.toString().padStart(3)} × ${file}`)
  }
}
