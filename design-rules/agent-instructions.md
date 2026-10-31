# Design rules: instructions for AI agents

This project's UI must follow Material Design 3. The rules are enforced by the
scripts in `design-rules/` (values in `design-rules/m3.js`).

## Building screens

- Use react-native-paper components (`Button`, `Text`, `TextInput`, `Switch`, `IconButton`,
  `FAB`, `Chip`, `Card`, `Dialog`, `Appbar`, `List`…). The theme maps them to M3.
  Never use React Native's `Text`, `TextInput`, `Button`, `Switch`, `Touchable*` or
  `Pressable`, or HTML tags. `View` and `ScrollView` are fine for layout.
- Every `<Text>` gets an M3 `variant`: `displayLarge|Medium|Small`, `headline…`, `title…`,
  `body…`, `label…`.
- Button modes: `contained` (filled), `contained-tonal`, `elevated`, `outlined`, `text`.
  At most one `contained` button per group. Don't use `compact`, `dense` or `customSize`.
- Put two or more buttons side by side in `<ButtonRow>` (`src/components/ButtonRow.jsx`),
  `Dialog.Actions` or `Card.Actions`.
- Wrap screen content in `<Page>` (`src/components/Page.jsx`). It applies the M3 window
  margins and keeps clear of the status bar; use `<Page belowAppbar>` under an `Appbar.Header`.
  Use `useWindowMargin()` from the same file for anything placed against the screen edge (a FAB).
- Give dialogs `style={useDialogStyle()}` (from `src/theme/m3Theme.js`) and put them in `<Portal>`.
- Colors come from the theme: `const theme = useTheme()`, then `theme.colors.primary`,
  `theme.colors.onSurfaceVariant`, `theme.colors.surfaceContainer`… Never hex, rgb or color names.
- Margin, padding and gap values are dp numbers on the 4dp grid (4, 8, 12, 16, 24…).
- Don't set `height`, `minHeight`, `borderRadius` or font properties on Paper components via
  `style`, `contentStyle`, `labelStyle` and so on.
- Register every new screen in `src/screens/registry.js`, or it won't be checked.

## Checking your work

After creating or changing a screen, run:

```
npm run design:check:llm               # full check (about 30s)
npm run design:check:llm -- --static   # code-only check (seconds), useful while iterating
```

Output is one line per violation, grouped by file:
`<line>:<col> <rule>: <message> [<viewports> only]`. Exit code 0 = clean,
1 = violations, 2 = the check itself failed (an ERROR line says why).
Repeat until it prints `design:check OK`.

If an iOS simulator is booted, also run `npm run design:device` (about 20s). It
screenshots every screen on the simulator and compares it with an approved baseline.
Look at the screenshots of the screens you changed (`.design-report/device/<screen>.png`):
check for content under the status bar or notch, clipped or overlapping elements,
and anything that differs from the web build. A changed or new screen is expected
when you changed it. Tell the user and let them approve it; never run `--update` yourself.

If the design-check Stop hook is on (`npm run design:hook:status`), it runs the
code-only check when you finish, on the files you changed in this session. If it
reports violations, fix them in the code before finishing.
Violations in files you didn't touch are not your task unless the user asks.

## Don't

- Don't edit anything in `design-rules/`, add `eslint-disable` comments, add
  `designIgnore` data attributes, or turn off the design-check hook to make the check pass. If a rule seems wrong
  for a case, stop and ask the user.
