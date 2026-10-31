// Material Design 3 theme for react-native-paper. Paper implements M3 already;
// this sets its color roles, type scale and roundness from design-rules/m3.js,
// the same file the checkers read.

import { useWindowDimensions } from 'react-native';
import { argbFromHex, hexFromArgb, Hct, MaterialDynamicColors, SchemeTonalSpot } from '@material/material-color-utilities';
import { configureFonts, MD3LightTheme } from 'react-native-paper';
import { m3 } from '../../design-rules/m3.js';

const ROLES = [
  'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
  'background', 'onBackground', 'surface', 'onSurface', 'surfaceVariant', 'onSurfaceVariant',
  'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh', 'surfaceContainerHighest',
  'outline', 'outlineVariant', 'inverseSurface', 'inverseOnSurface', 'inversePrimary', 'shadow', 'scrim',
];

function colorScheme(sourceHex) {
  const scheme = new SchemeTonalSpot(Hct.fromInt(argbFromHex(sourceHex)), false, 0);
  return Object.fromEntries(ROLES.map((r) => [r, hexFromArgb(MaterialDynamicColors[r].getArgb(scheme))]));
}

const c = colorScheme(m3.sourceColor);

const fonts = configureFonts({
  config: Object.fromEntries(
    Object.entries(m3.typeScale).map(([role, t]) => [
      role,
      { fontSize: t.size, lineHeight: t.lineHeight, fontWeight: String(t.weight), letterSpacing: t.tracking },
    ]),
  ),
});

export const theme = {
  ...MD3LightTheme,
  roundness: m3.roundness,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    ...c,
    // Paper tints surfaces by elevation level; M3 maps them to surface containers.
    elevation: {
      level0: 'transparent',
      level1: c.surfaceContainerLow,
      level2: c.surfaceContainer,
      level3: c.surfaceContainerHigh,
      level4: c.surfaceContainerHigh,
      level5: c.surfaceContainerHighest,
    },
  },
};

// Paper dialogs stretch to the window width minus 26dp; M3 caps them at
// 560dp. Use <Dialog style={useDialogStyle()}>.
// It widens the side margins rather than setting maxWidth + alignSelf: on iOS,
// Paper's Surface puts those on different native layers and the dialog
// stretches to full height.
export function useDialogStyle() {
  const { width } = useWindowDimensions();
  return { marginHorizontal: Math.max(26, (width - m3.dialog.maxWidth) / 2) };
}
