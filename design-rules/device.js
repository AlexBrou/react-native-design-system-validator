// Device screenshot check: opens every screen in src/screens/registry.js on a
// booted iOS simulator (or Android emulator) through Expo Go, with Maestro,
// and compares each screenshot with its approved baseline.
//
// The rendered checks (rendered/) measure the web build; this catches what only
// shows on a device: safe areas, native fonts, platform-specific layout.
// It can't tell whether a screen follows M3, only whether it changed; a
// person approves each baseline once.
//
//   node design-rules/device.js                  compare with the baselines
//   node design-rules/device.js --update         accept the current screenshots as baselines
//   node design-rules/device.js --android        use the running Android emulator
//   node design-rules/device.js --json           same data as JSON
//
// Needs: Maestro (https://maestro.mobile.dev) and Java 17+, a booted simulator
// with Expo Go installed (`npm run ios` once does both). Starts Metro if it
// isn't running.
// Exit code 0 = no changes, 1 = changed or new screens, 2 = the check itself failed.

import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { screens } from '../src/screens/registry.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, '.design-report', 'device')
const args = new Set(process.argv.slice(2))
const android = args.has('--android')
const PORT = 8081
// A screen counts as changed when more than this share of its pixels differ.
const MAX_CHANGED = 0.001

class CheckError extends Error {}

function run(cmd, cmdArgs, options = {}) {
  const r = spawnSync(cmd, cmdArgs, { encoding: 'utf8', ...options })
  if (r.error) throw new CheckError(`${cmd} not found (${r.error.code})`)
  return r
}

// Maestro needs Java; use Homebrew's JDK when none is on the PATH.
function javaEnv() {
  const env = { ...process.env }
  if (run('java', ['-version'], { env }).status === 0) return env
  for (const jdk of ['openjdk@17', 'openjdk@21', 'openjdk']) {
    const home = `/opt/homebrew/opt/${jdk}`
    if (existsSync(path.join(home, 'bin', 'java'))) return { ...env, JAVA_HOME: home, PATH: `${home}/bin:${env.PATH}` }
  }
  throw new CheckError('Maestro needs Java 17+ (brew install openjdk@17)')
}

function iosDevice() {
  const { devices } = JSON.parse(run('xcrun', ['simctl', 'list', 'devices', 'booted', '-j']).stdout)
  const [runtime, list] = Object.entries(devices).find(([, l]) => l.length) ?? []
  if (!list) throw new CheckError('no booted iOS simulator. Run `npm run ios` once (it boots one and installs Expo Go).')
  const device = list[0]
  if (!run('xcrun', ['simctl', 'listapps', device.udid]).stdout.includes('host.exp.Exponent')) {
    throw new CheckError(`Expo Go is not installed on ${device.name}. Run \`npm run ios\` once.`)
  }
  // Same clock and bars on every run, so they never show up as a change.
  run('xcrun', ['simctl', 'status_bar', device.udid, 'override', '--time', '9:41', '--batteryState', 'charged', '--batteryLevel', '100', '--wifiBars', '3', '--cellularBars', '4'])
  const os = runtime.split('.').pop().replace(/-(\d+)-(\d+)$/, ' $1.$2')
  return { name: `${device.name} (${os})`, slug: `${device.name} ${os}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), host: '127.0.0.1' }
}

function androidDevice() {
  const serial = run('adb', ['devices']).stdout.split('\n').slice(1).find((l) => l.endsWith('\tdevice'))?.split('\t')[0]
  if (!serial) throw new CheckError('no running Android emulator. Run `npm run android` once (it installs Expo Go).')
  const prop = (p) => run('adb', ['-s', serial, 'shell', 'getprop', p]).stdout.trim()
  const name = `${prop('ro.product.model')} (Android ${prop('ro.build.version.release')})`
  // 10.0.2.2 is the host machine as seen from the emulator.
  return { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, ''), host: '10.0.2.2' }
}

async function metroRunning() {
  try {
    return (await (await fetch(`http://localhost:${PORT}/status`)).text()).includes('running')
  } catch {
    return false
  }
}

async function startMetro() {
  if (await metroRunning()) return null
  const metro = spawn('npx', ['expo', 'start', '--port', String(PORT)], { cwd: ROOT, stdio: 'ignore', detached: true })
  for (let i = 0; i < 90; i++) {
    if (await metroRunning()) return metro
    await new Promise((r) => setTimeout(r, 1000))
  }
  process.kill(-metro.pid)
  throw new CheckError(`Metro did not start on port ${PORT}`)
}

// The file a registry entry loads: () => import('./Checkout.jsx') -> src/screens/Checkout.jsx
function screenFile(screen) {
  const rel = screen.load.toString().match(/import\(\s*['"](.+?)['"]\s*\)/)?.[1]
  return rel ? path.posix.join('src/screens', rel) : `#/${screen.id}`
}

function flow(host) {
  const link = (id) => `exp://${host}:${PORT}/--/${id}`
  const steps = [
    `- openLink: ${link('')}`,
    // The first open waits for Metro to bundle the app.
    '- extendedWaitUntil:\n    visible: Screens\n    timeout: 120000',
    ...screens.flatMap((s) => [`- openLink: ${link(s.id)}`, '- waitForAnimationToEnd:\n    timeout: 10000', `- takeScreenshot: ${s.id}`]),
  ]
  return `appId: host.exp.Exponent\n---\n${steps.join('\n')}\n`
}

function findScreenshots(dir) {
  const found = new Map()
  ;(function walk(d) {
    for (const f of readdirSync(d)) {
      const p = path.join(d, f)
      if (statSync(p).isDirectory()) walk(p)
      else if (f.endsWith('.png') && path.basename(d) === 'takeScreenshot') found.set(f.slice(0, -4), p)
    }
  })(dir)
  return found
}

function compare(currentPath, baselinePath, diffPath) {
  const a = PNG.sync.read(readFileSync(baselinePath))
  const b = PNG.sync.read(readFileSync(currentPath))
  if (a.width !== b.width || a.height !== b.height) return { changed: 1, reason: `size changed from ${a.width}x${a.height} to ${b.width}x${b.height}` }
  const diff = new PNG({ width: a.width, height: a.height })
  const pixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 })
  writeFileSync(diffPath, PNG.sync.write(diff))
  return { changed: pixels / (a.width * a.height) }
}

function htmlReport(device, results) {
  const img = (p) => (p ? `<img src="${path.relative(OUT, p)}" loading="lazy">` : '<p>(none)</p>')
  const rows = results
    .map((r) => `<section><h2>${r.id} — ${r.status}${r.changed ? ` (${(r.changed * 100).toFixed(2)}% of pixels)` : ''}</h2><p>${r.file}</p>
<div class="row"><figure>${img(r.baseline)}<figcaption>Baseline</figcaption></figure><figure>${img(r.current)}<figcaption>Now</figcaption></figure><figure>${img(r.diff)}<figcaption>Difference</figcaption></figure></div></section>`)
    .join('\n')
  return `<!doctype html><meta charset="utf-8"><title>Device screenshots</title>
<style>body{font:14px system-ui;margin:24px}.row{display:flex;gap:16px}figure{margin:0}img{width:280px;border:1px solid #ccc}h2{font-size:16px;margin:24px 0 4px}</style>
<h1>Device screenshots: ${device.name}</h1>${rows}`
}

let metro = null
const errors = []
let results = []
let device = null

try {
  device = android ? androidDevice() : iosDevice()
  const env = javaEnv()
  metro = await startMetro()

  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })
  const flowFile = path.join(OUT, 'flow.yaml')
  writeFileSync(flowFile, flow(device.host))
  const maestro = run('maestro', ['test', '--test-output-dir', path.join(OUT, 'maestro'), flowFile], { cwd: OUT, env, maxBuffer: 1 << 26 })
  if (maestro.status !== 0) {
    const failed = (maestro.stdout + maestro.stderr).split('\n').find((l) => /FAILED|Error/.test(l))
    throw new CheckError(`maestro failed: ${failed?.trim() ?? 'see .design-report/device/maestro'}`)
  }

  const shots = findScreenshots(path.join(OUT, 'maestro'))
  const baselines = path.join(ROOT, 'design-rules', 'device', 'baselines', device.slug)
  mkdirSync(baselines, { recursive: true })
  for (const s of screens) {
    const shot = shots.get(s.id)
    const r = { id: s.id, file: screenFile(s), status: 'unchanged' }
    if (!shot) {
      errors.push(`no screenshot for ${s.id}`)
      continue
    }
    r.current = path.join(OUT, `${s.id}.png`)
    copyFileSync(shot, r.current)
    const baseline = path.join(baselines, `${s.id}.png`)
    if (args.has('--update')) {
      copyFileSync(shot, baseline)
      r.status = 'updated'
    } else if (!existsSync(baseline)) {
      r.status = 'new'
    } else {
      r.baseline = baseline
      r.diff = path.join(OUT, `${s.id}-diff.png`)
      const c = compare(shot, baseline, r.diff)
      if (c.changed > MAX_CHANGED) Object.assign(r, { status: 'changed', changed: c.changed, reason: c.reason })
    }
    results.push(r)
  }
  writeFileSync(path.join(OUT, 'index.html'), htmlReport(device, results))
} catch (e) {
  errors.push(e instanceof CheckError ? e.message : e.stack)
} finally {
  if (metro) process.kill(-metro.pid)
}

const flagged = results.filter((r) => r.status === 'changed' || r.status === 'new')

if (args.has('--json')) {
  console.log(JSON.stringify({ ok: !flagged.length && !errors.length, device: device?.name, screens: results, errors }))
} else if (args.has('--update') && !errors.length) {
  console.log(`design:device baselines updated for ${results.length} screens on ${device.name} (design-rules/device/baselines/${device.slug}/). Commit them.`)
} else if (!flagged.length && !errors.length) {
  console.log(`design:device OK — ${results.length} screens unchanged on ${device.name}`)
} else {
  if (flagged.length) {
    console.log(`design:device REVIEW — ${flagged.length} of ${results.length} screens on ${device.name}. Look at .design-report/device/<screen>.png (report: .design-report/device/index.html). If a change is intended, ask the user to approve it with npm run design:device -- --update.`)
    for (const r of flagged) {
      const what = r.status === 'new' ? 'no baseline yet' : r.reason ?? `${(r.changed * 100).toFixed(2)}% of pixels changed`
      console.log(`${r.file}\n  ${r.id}: ${what} (.design-report/device/${r.id}.png)`)
    }
  }
  for (const e of errors) console.log(`ERROR ${e}`)
}

process.exitCode = errors.length ? 2 : flagged.length ? 1 : 0
