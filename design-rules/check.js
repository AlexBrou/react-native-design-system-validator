// Compact design check for LLM agents and CI: runs both layers and prints one
// line per violation, grouped by file, deduplicated across viewports.
//
//   node design-rules/check.js            static + rendered, compact text
//   node design-rules/check.js --static   static only (seconds)
//   node design-rules/check.js --json     same data as JSON
//   node design-rules/check.js --since <epoch ms>
//                                         only files modified since then
//
// Exit code 0 = no violations, 1 = violations, 2 = the check itself failed.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const args = new Set(argv)
const since = args.has('--since') ? Number(argv[argv.indexOf('--since') + 1]) : null
let violations = []
const errors = []

async function runStatic() {
  const results = await new ESLint({ cwd: ROOT }).lintFiles(['src'])
  for (const r of results) {
    for (const m of r.messages) {
      if (!m.ruleId) errors.push(`${path.relative(ROOT, r.filePath)}:${m.line} ${m.message}`)
      else violations.push({ file: path.relative(ROOT, r.filePath), line: m.line, col: m.column, rule: m.ruleId.replace(/^m3\//, ''), message: m.message })
    }
  }
}

function runRendered() {
  const out = path.join(ROOT, '.design-report', 'rendered.json')
  rmSync(out, { force: true })
  const run = spawnSync('npx', ['playwright', 'test', '-c', 'design-rules', '--reporter=json'], {
    cwd: ROOT,
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_FILE: out },
    encoding: 'utf8',
  })
  if (!existsSync(out)) {
    errors.push(`rendered checks did not run: ${(run.stderr || run.stdout).trim().split('\n').slice(-3).join(' | ')}`)
    return
  }
  const report = JSON.parse(readFileSync(out, 'utf8'))
  const projects = new Set()
  const seen = new Map()

  ;(function walk(suite, titles) {
    for (const s of suite.suites ?? []) walk(s, [...titles, s.title])
    for (const spec of suite.specs ?? []) {
      const screen = titles.at(-1)
      for (const t of spec.tests) {
        projects.add(t.projectName)
        const result = t.results.at(-1)
        // Recent Playwright versions report annotations on both; prefer the result's.
        const annotations = result?.annotations?.length ? result.annotations : (t.annotations ?? [])
        if (result?.status === 'failed' && !annotations.length) {
          errors.push(`${screen} ${spec.title} [${t.projectName}]: ${(result.error?.message ?? 'failed').split('\n')[0]}`)
        }
        for (const a of annotations) {
          const [file, line, col] = a.type.split(':')
          const key = `${a.type}|${spec.title}|${a.description}`
          if (!seen.has(key)) {
            const v = { file, line: Number(line) || 0, col: Number(col) || 0, rule: spec.title, message: a.description, screen, viewports: [] }
            seen.set(key, v)
            violations.push(v)
          }
          seen.get(key).viewports.push(t.projectName)
        }
      }
    }
  })(report, [])

  // Only mention viewports when a violation doesn't happen in all of them.
  for (const v of seen.values()) if (v.viewports.length === projects.size) delete v.viewports
}

function printText() {
  if (!violations.length && !errors.length) {
    console.log('design:check OK — 0 violations')
    return
  }
  const byFile = Map.groupBy(violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.col - b.col), (v) => v.file)
  console.log(`design:check FAIL — ${violations.length} violations in ${byFile.size} files. Fix the code; do not edit design-rules/ or add ignores.`)
  for (const [file, list] of byFile) {
    console.log(file)
    for (const v of list) {
      const where = v.viewports ? ` [${v.viewports.join(',')} only]` : ''
      console.log(`  ${v.line}:${v.col} ${v.rule}: ${v.message}${where}`)
    }
  }
  for (const e of errors) console.log(`ERROR ${e}`)
}

try {
  await runStatic()
  if (!args.has('--static')) runRendered()
} catch (e) {
  errors.push(e.message)
}

if (since !== null) {
  const changed = (file) => {
    try {
      return statSync(path.join(ROOT, file)).mtimeMs >= since
    } catch {
      return false
    }
  }
  violations = violations.filter((v) => changed(v.file))
}

if (args.has('--json')) console.log(JSON.stringify({ ok: !violations.length && !errors.length, violations, errors }))
else printText()

process.exitCode = errors.length ? 2 : violations.length ? 1 : 0
