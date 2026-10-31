// Claude Code "Stop" hook (registered in .claude/settings.json).
// When the agent tries to finish, runs the design check on the files changed
// in this session. If any have violations, it blocks the stop (exit 2) and
// feeds the compact list back to the agent so it fixes them.
//
// - Only files modified since the session started are reported, so existing
//   violations elsewhere in the project never block unrelated work.
// - It blocks at most once in a row (stop_hook_active): if violations remain
//   after the agent's attempt, the agent may stop and the user sees a warning.
// - Static check by default (seconds). Pass --rendered to also run the
//   browser checks (about 30s on every stop).

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

let input = {}
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}')
} catch {}

// Session start = first timestamp in the transcript. Without it, check everything.
function sessionStart() {
  try {
    for (const line of readFileSync(input.transcript_path, 'utf8').split('\n')) {
      const ts = line && JSON.parse(line).timestamp
      if (ts) return Date.parse(ts)
    }
  } catch {}
  return 0
}

const args = ['design-rules/check.js', '--since', String(sessionStart())]
if (!process.argv.includes('--rendered')) args.push('--static')
const run = spawnSync('node', args, { cwd: ROOT, encoding: 'utf8' })

if (run.status === 0) process.exit(0)

const report = run.stdout.trim()
if (run.status === 1 && !input.stop_hook_active) {
  console.error(`${report}\n(Design check hook: fix these, then finish. See design-rules/agent-instructions.md.)`)
  process.exit(2)
}

// Already retried once, or the check itself failed: let the agent stop, tell the user.
const summary = (report.split('\n')[0] || run.stderr.trim().split('\n').pop() || '').replace(/^design:check /, '').replace(/\. Fix the code.*$/, '')
console.log(JSON.stringify({ systemMessage: `Design check: ${summary}. Run npm run design:check:llm for details.` }))
process.exit(0)
