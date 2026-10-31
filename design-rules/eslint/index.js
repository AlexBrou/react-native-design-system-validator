// ESLint plugin with the static M3 rules. Imported by /eslint.config.js.
// To add a rule: create a file in this folder, register it below.

import allowedPropValues from './allowed-prop-values.js';
import buttonsInGroup from './buttons-in-group.js';
import noNativeControls from './no-native-controls.js';
import noRawColors from './no-raw-colors.js';
import noSpecOverrides from './no-spec-overrides.js';
import spacingOnGrid from './spacing-on-grid.js';

export const plugin = {
  meta: { name: 'm3' },
  rules: {
    'allowed-prop-values': allowedPropValues,
    'buttons-in-group': buttonsInGroup,
    'no-native-controls': noNativeControls,
    'no-raw-colors': noRawColors,
    'no-spec-overrides': noSpecOverrides,
    'spacing-on-grid': spacingOnGrid,
  },
};

// Which files the design rules apply to. The theme is where raw values are
// allowed to live, so it is excluded.
export const designRulesConfig = {
  files: ['src/**/*.{js,jsx}'],
  ignores: ['src/theme/**'],
  plugins: { m3: plugin },
  rules: Object.fromEntries(Object.keys(plugin.rules).map((name) => [`m3/${name}`, 'error'])),
};
