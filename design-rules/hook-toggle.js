// Turns the Claude Code design-check Stop hook on or off by adding/removing
// its entry in .claude/settings.json. Other settings and hooks are kept.
//
//   node design-rules/hook-toggle.js on [--local] [--rendered]
//   node design-rules/hook-toggle.js off [--local]
//   node design-rules/hook-toggle.js status
//
// --local    use .claude/settings.local.json (just for you, not committed)
// --rendered also run the browser checks on every stop (about 30s)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const [action, ...flags] = process.argv.slice(2)
const MARKER = 'design-rules/claude-stop-hook.js'

function settingsPath(local) {
  return path.join(ROOT, '.claude', local ? 'settings.local.json' : 'settings.json')
}

function read(file) {
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
}

function isOurs(group) {
  return group.hooks?.some((h) => h.command?.includes(MARKER))
}

function enabledIn(file) {
  return (read(file).hooks?.Stop ?? []).some(isOurs)
}

function remove(settings) {
  const stop = (settings.hooks?.Stop ?? []).filter((g) => !isOurs(g))
  if (settings.hooks) {
    if (stop.length) settings.hooks.Stop = stop
    else delete settings.hooks.Stop
    if (!Object.keys(settings.hooks).length) delete settings.hooks
  }
  return settings
}

function write(file, settings) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`)
}

const file = settingsPath(flags.includes('--local'))
const rel = path.relative(ROOT, file)

if (action === 'on') {
  const settings = remove(read(file))
  const command = `node "$CLAUDE_PROJECT_DIR/${MARKER}"${flags.includes('--rendered') ? ' --rendered' : ''}`
  settings.hooks ??= {}
  settings.hooks.Stop ??= []
  settings.hooks.Stop.push({ hooks: [{ type: 'command', command, timeout: 90, statusMessage: 'Checking design rules…' }] })
  write(file, settings)
  console.log(`Design check hook ON (${rel}). In an open Claude Code session, run /hooks once or restart to pick it up.`)
} else if (action === 'off') {
  if (existsSync(file)) write(file, remove(read(file)))
  console.log(`Design check hook OFF (${rel}).`)
} else if (action === 'status') {
  for (const local of [false, true]) {
    const f = settingsPath(local)
    console.log(`${path.relative(ROOT, f)}: ${enabledIn(f) ? 'ON' : 'off'}`)
  }
} else {
  console.log('Usage: node design-rules/hook-toggle.js on|off|status [--local] [--rendered]')
  process.exitCode = 1
}
