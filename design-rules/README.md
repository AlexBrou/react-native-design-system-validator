# Design rules (Material Design 3)

All the design-system rules for this app live in this folder. They are plain
scripts, so every check is deterministic and runs in CI like a test suite.

The app is React Native + [react-native-paper](https://callstack.github.io/react-native-paper/)
(Paper implements M3). The static rules read the source; the rendered rules run the app
through react-native-web (Expo's web target) in Chromium and measure it there.

```
npm run design:check    # both layers
npm run design:lint     # static only (fast, also shows in the editor via ESLint)
npm run design:render   # rendered only (opens every screen in a browser, via react-native-web)
npm run design:report   # open the HTML report with highlighted screenshots
npm run design:device   # screenshot every screen on the iOS simulator, compare with baselines
npm run design:check:llm             # compact output for AI agents/CI: one line per violation
npm run design:check:llm -- --static # same, code checks only (seconds)
npm run design:check:llm -- --json   # same data as JSON
```

## Working with AI agents

Designers who build screens with an AI agent (Claude Code or similar) get two safeguards.

### 1. Instructions: `agent-instructions.md`

This file tells the agent which components and variants to use, to register new
screens, to run the check until it passes, and **not** to make the check pass by
editing `design-rules/`, adding `eslint-disable`, or adding a `designIgnore` data attribute. If a
rule seems wrong, the agent should ask the user.

Claude Code loads it through the project's root `CLAUDE.md`, which contains one line:

```
@design-rules/agent-instructions.md
```

It is imported from the root because Claude Code reads a `CLAUDE.md` inside a
subfolder only when it opens files there, and agents mostly work in `src/`. Other
agents can be pointed at the same file.

### 2. Compact output: `check.js`

`npm run design:check:llm` prints one line per violation, grouped by file, with each
violation listed once across viewports. That is about 10× fewer tokens than the
Playwright output. A clean run prints a single line.

```
design:check FAIL — 35 violations in 2 files. Fix the code; do not edit design-rules/ or add ignores.
src/screens/Checkout.jsx
  29:55 allowed-prop-values: <TextInput dense> changes the M3 size of the component. Remove it.
  37:13 component-size: Button "Pay later" is 36px tall; M3 Button allows 40px
  42:7 window-margins: FAB "Help" is 8px from the screen edge; compact windows need 16px [compact only]
```

| Option | Effect |
|---|---|
| `-- --static` | Code checks only (seconds) |
| `-- --json` | Same data as JSON: `{ ok, violations: [{ file, line, col, rule, message, screen?, viewports? }], errors }` |
| `-- --since <epoch ms>` | Only violations in files modified since then |

Exit codes: `0` = clean, `1` = violations, `2` = the check itself failed (an `ERROR` line says why).

### 3. Automatic check: `claude-stop-hook.js` (off by default)

A Claude Code **Stop hook** that you turn on with `npm run design:hook:on`. When the
agent tries to finish, the hook:

1. Runs the code checks (`check.js --static`), takes 2–3s.
2. Keeps only violations in files **modified during this session**. Existing
   violations elsewhere (like the demo `Checkout`/`Promo` screens) never block
   unrelated work.
3. If there are any, it **blocks the stop** and gives the agent the compact list,
   so the agent fixes them before handing back.
4. It blocks **at most once in a row**. If violations remain after the agent's
   attempt, the agent may stop, and the user sees
   `Design check: FAIL — N violations… Run npm run design:check:llm for details.`
   This prevents endless loops when a rule needs a human decision.

#### Turning it on and off

```bash
npm run design:hook:on                # on for everyone: .claude/settings.json (commit it to share)
npm run design:hook:on -- --local     # on just for you: .claude/settings.local.json (not committed)
npm run design:hook:on -- --rendered  # also run the rendered checks on every stop (about 30s each)
npm run design:hook:off               # off (add -- --local for the personal one)
npm run design:hook:status            # where it is on
```

`hook-toggle.js` only adds or removes the entry whose command runs
`claude-stop-hook.js`; other settings and hooks in the file are kept. If Claude Code
is already open, run `/hooks` once or restart it so it picks up the change. The
`/hooks` menu in Claude Code also lets you review or disable it by hand.

**When to leave it off:** while you work on files that break the rules on purpose
(like the demo screens). Every stop in that session would be blocked once.
Turn it on when designers start building screens with an agent.

To add the hook by hand, put this in `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [{ "hooks": [{
      "type": "command",
      "command": "node \"$CLAUDE_PROJECT_DIR/design-rules/claude-stop-hook.js\"",
      "timeout": 90,
      "statusMessage": "Checking design rules…"
    }] }]
  }
}
```

## Using this in another project

The project must use react-native-paper and run on the web (Expo: `npx expo install react-dom react-native-web @expo/metro-runtime`).

1. Copy the `design-rules/` folder to the project root.
2. `npm i -D eslint globals @playwright/test && npx playwright install chromium`
3. Spread `designRulesConfig` from `design-rules/eslint/index.js` into `eslint.config.js`.
4. Add `design-rules/babel-plugin-source.cjs` to your Babel plugins for web dev builds
   (see `/babel.config.cjs`).
5. Theme Paper from `m3.js` (copy `src/theme/m3Theme.js`) and copy `src/components/ButtonRow.jsx`
   and `Page.jsx`, or point `m3.buttonGroupParents` at your own components.
6. Export your screens from `src/screens/registry.js` (`{ id, load }`). On web, route `/#/<id>`
   to each one and render it inside `<View dataSet={{ screen: id, primaryColor: theme.colors.primary }}>`
   (see `src/App.jsx`), or adapt `rendered/rendered.spec.js` to your navigation (for example
   React Navigation's linking config).
7. Copy the `design:*` scripts from this `package.json`.
8. Add `@design-rules/agent-instructions.md` to the project's `CLAUDE.md`.
9. Optional: turn on the Claude Code hook with `npm run design:hook:on`
   (it merges into any existing `.claude/settings.json`).

## Layout

```
design-rules/
  m3.js                 ← the M3 values. The theme (src/theme) and every rule read this file.
  eslint/               ← static rules: read the source code
  rendered/             ← rendered rules: measure the app (react-native-web) in Chromium
  playwright.config.js  ← which viewports (window size classes) to check; starts `expo start --web`
  babel-plugin-source.cjs ← web dev builds only: tags JSX elements with their file:line for the reports
  check.js              ← compact runner for AI agents/CI (npm run design:check:llm)
  device.js             ← screenshots on the iOS simulator vs. approved baselines (npm run design:device)
  device/baselines/     ← the approved screenshots, per device
  claude-stop-hook.js   ← Claude Code hook: checks the agent's work before it finishes
  hook-toggle.js        ← turns that hook on/off (npm run design:hook:on|off|status)
  agent-instructions.md ← instructions AI agents follow (imported by /CLAUDE.md)
```

## Where a violation comes from

Static violations come with file and line from ESLint itself. For rendered ones,
`babel-plugin-source.cjs` (registered in `/babel.config.cjs`, web dev builds only)
adds `dataSet={{ source: "src/screens/Checkout.jsx:37:13", component: "Button" }}` to
every JSX element in `src/`. react-native-web renders it as `data-source` and
`data-component` attributes. Each violation reports the nearest element with a
`data-source`, in the terminal (`at src/…:37:13`, clickable in VS Code) and in the
HTML report (Annotations box plus a code snippet of the line).

The location is the JSX element that rendered the offending node. If the cause is
a style defined in another file (see `Promo.jsx`), it points to the element that
uses the style. Elements that a library renders in a portal (a `Dialog`'s surface)
have no tagged ancestor, so they point to the first tagged element inside them
(the `Dialog.Title`). Components that don't pass unknown props down to a `View`
don't get the attributes; their violations point to the nearest tagged parent.

## How the rendered checks find components

react-native-web renders everything as `<div>`s with generated class names, so the
rules can't use CSS classes the way a MUI version would. They use:

- **`data-testid`**: Paper gives each component a default `testID` (`button-container`,
  `fab-container`, `chip-container`, `card-container`, `modal-surface`, `appbar-header`…).
  The selectors are in `m3.components`. **If you pass your own `testID` to a Paper
  component, the rendered checks no longer see it** (text fields are the exception:
  they're found by their outline, which has a fixed ID).
- **`data-component`**: the JSX name you wrote (`View`, `Dialog.Actions`, `ButtonRow`), from the Babel plugin.
  `spacing-grid` and `dialog-layout` use it.
- **ARIA roles** (`role="button"`, `role="switch"`…) for touch targets.
- **The theme's primary color** (on the `data-screen` wrapper) to tell filled buttons apart.

## Where react-native-paper is off the M3 spec

Paper implements M3 closely but not exactly. These differences can't be fixed from the theme:

| Component | Paper | M3 | How the checks handle it |
|---|---|---|---|
| Text button | 38dp tall (keeps the M2 label margin) | 40dp | `tolerance: 2` on `m3.components.button` |
| Outlined button / chip | 42 / 34dp (border outside the box) | 40 / 32dp | same tolerance |
| `List.Item` title/description | font size, no line height | body roles | caught by `type-scale`; pass `titleStyle={theme.fonts.bodyLarge}` (see `Settings.jsx`) |
| Text-field label | line height 1.2× on web | body roles | skipped by `type-scale` |
| `Dialog` | fills the window minus 26dp | 280–560dp | `useDialogStyle()` in the theme |

## Device screenshots (`device.js`)

The rendered checks measure the web build. Running the demo on the iPhone simulator
found two bugs they missed: content under the status bar (the web has no notch) and a
dialog stretched to full height (Paper's `Surface` splits styles across two native
layers on iOS). `device.js` covers that gap:

```
npm run design:device               # compare every screen with its baseline
npm run design:device -- --update   # approve the current screenshots as the baselines
npm run design:device -- --android  # use the running Android emulator instead
```

For each screen in `src/screens/registry.js`, a [Maestro](https://maestro.mobile.dev) flow
opens the deep link `exp://…/--/<screen-id>` in Expo Go, waits for animations to end
and takes a screenshot. Each one is compared, pixel by pixel, with
`design-rules/device/baselines/<device>/<screen-id>.png`. More than 0.1% of pixels
different (or no baseline yet) flags the screen for review. The report is
`.design-report/device/index.html` (baseline, now, difference).

- **It finds changes, not M3 violations.** A person looks at each baseline once, and
  again whenever a screen changes. AI agents can read the screenshots too: the
  agent instructions ask them to check the screens they changed and never to approve baselines.
- **Baselines are per device.** Screen size and OS version change every pixel, so use
  the same simulator as the baselines (they're in folders like `iphone-17-ios-26-5`).
- **The status bar is frozen** (9:41, full battery) on iOS so the clock is never a change.
  On Android it isn't yet; use an emulator with the status bar in demo mode.
- **Needs:** Maestro, Java 17+ (Homebrew's is found automatically), and a booted
  simulator with Expo Go (`npm run ios` once). It starts Metro if it isn't running.
- About 20s for 5 screens. Not part of `design:check` or the Stop hook, because it
  needs a simulator. Exit codes as `check.js`.

The Android path (`--android`) has not been tried on an emulator yet.

## Two layers, and why

| | Static (`eslint/`) | Rendered (`rendered/`) |
|---|---|---|
| Looks at | JSX source (inline styles and `StyleSheet.create` in the same file) | The app through react-native-web: layout and computed styles in Chromium |
| Speed | Instant, in the editor | About 30s for all screens |
| Catches | `dense`/`compact`/`customSize`, raw colors, off-grid spacing values, sibling buttons without a `ButtonRow`, spec overrides via `style`, React Native primitives (`Text`, `TouchableOpacity`…) | Real gaps, sizes, corner radii, type scale, touch-target overlap, dialog layout, window margins, number of FABs |
| Blind to | Styles imported from other files, computed values, composed components, layout | Intent (why something is wrong in the code), and anything that only differs on iOS/Android |

`src/screens/Promo.jsx` shows why you need both: it passes ESLint, but the styles
it imports from `promo.styles.js` break five rendered rules.

## Static rules (`eslint/`)

| Rule | What it enforces |
|---|---|
| `m3/allowed-prop-values` | Only M3 values (`m3.allowedProps`): Text type roles, Button modes, FAB `small/medium/large`; no `dense` TextInput, `compact` Button/Chip |
| `m3/buttons-in-group` | Sibling `<Button>`s must be inside `ButtonRow` / `Dialog.Actions` / `Card.Actions` |
| `m3/no-native-controls` | No React Native `Text`, `TextInput`, `Button`, `Switch`, `Touchable*`, `Pressable`, `Modal` (tracked through imports, so `Text as RNText` is caught), no HTML tags |
| `m3/no-raw-colors` | No hex / rgb / hsl / named colors; use theme color roles |
| `m3/no-spec-overrides` | No `style`/`contentStyle`/`labelStyle`… overrides of height, radius, type on Paper components (follows `styles.x` from a `StyleSheet.create` in the same file); no FAB `customSize` |
| `m3/spacing-on-grid` | Margin, padding and gap are dp numbers on the 4dp grid, in inline styles and every `StyleSheet.create` |

## Rendered rules (`rendered/`)

Every rule runs on every screen in `src/screens/registry.js`, at each viewport
in `playwright.config.js` (compact 412px, expanded 1280px).

| Rule | What it measures |
|---|---|
| `button-gap` | Horizontally adjacent buttons are exactly 8px apart |
| `one-filled-button-per-group` | At most one filled button per group of adjacent buttons |
| `component-size` | Heights/widths from `m3.components` (Button 40, FAB 40/56/96, Chip 32, TextInput 56, Appbar 64…) |
| `component-shape` | Corner radius from `m3.components` + `m3.shape` |
| `type-scale` | Every visible text matches an M3 type role (size + line height + weight) |
| `touch-target` | 48x48 touch targets don't overlap |
| `single-fab` | At most one FAB per screen |
| `dialog-layout` | Dialog 280–560px wide, 24px side padding, end-aligned actions |
| `spacing-grid` | Padding and gaps of layout elements (`View`, `ScrollView`, `Card.Content`…), and the margins of their children, are multiples of 4px |
| `window-margins` | Content keeps 16px (compact) / 24px (medium, expanded) from the screen edge |

## Changing things

- **Change a value** (for example, button gap 8 → 12): edit `m3.js`. The theme and both layers update.
- **Add a static rule:** add a file in `eslint/` (a standard ESLint rule) and register it in `eslint/index.js`.
- **Add a rendered rule:** add a file in `rendered/` that exports
  `{ id, description, check(m3, h) { return [{ el, message }] } }` and list it in `rendered/index.js`.
  `check` is sent into the browser, so it may only use `m3` and the helpers `h` (`rendered/helpers.js`).
- **Check another Paper component:** add it to `m3.components` with the selector of its default `testID`
  (look for `testID = '…'` in `node_modules/react-native-paper/src/components/`).
- **Add a screen:** add it to `src/screens/registry.js`. It is checked automatically.
- **Add a viewport:** add a project in `playwright.config.js`.

## Exceptions

- Static: `// eslint-disable-next-line m3/no-raw-colors -- brand logo color`
- Rendered: put `dataSet={{ designIgnore: 'button-gap type-scale' }}` on an element; it and its subtree are skipped for those rules.

## Sources

Values come from the official M3 design tokens
(`material-components/material-web`, `tokens/versions/v0_192`: `md-sys-typescale`,
`md-sys-shape`, `md-comp-*`) and the material-web dialog and button implementations,
plus the M3 guidelines at m3.material.io (touch targets, window size classes).
react-native-paper implements M3; `src/theme/m3Theme.js` sets its colors, type scale and roundness from `m3.js`.
