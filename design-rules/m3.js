// Material Design 3 values used by the theme (src/theme) AND by every checker
// in this folder. Change a value here and both the app and the rules follow.
//
// Sources: the official M3 design tokens published in material-web
//   https://github.com/material-components/material-web/tree/main/tokens/versions/v0_192
// and the M3 guidelines at https://m3.material.io.
//
// Keep this file plain data (no functions): it is serialized and sent into the
// browser for the rendered checks.

export const m3 = {
  sourceColor: '#6750A4',

  // M3 lays everything out on a 4dp grid. React Native styles are in dp, so
  // margin / padding / gap values must be multiples of 4.
  grid: 4,

  // react-native-paper derives every corner radius from theme.roundness
  // (Button 5×, Chip 2×, Card 3×, Dialog 7×…). 4 gives the M3 shape scale.
  roundness: 4,

  // md-sys-typescale (dp). weight 400 = regular, 500 = medium.
  typeScale: {
    displayLarge: { size: 57, lineHeight: 64, weight: 400, tracking: -0.25 },
    displayMedium: { size: 45, lineHeight: 52, weight: 400, tracking: 0 },
    displaySmall: { size: 36, lineHeight: 44, weight: 400, tracking: 0 },
    headlineLarge: { size: 32, lineHeight: 40, weight: 400, tracking: 0 },
    headlineMedium: { size: 28, lineHeight: 36, weight: 400, tracking: 0 },
    headlineSmall: { size: 24, lineHeight: 32, weight: 400, tracking: 0 },
    titleLarge: { size: 22, lineHeight: 28, weight: 400, tracking: 0 },
    titleMedium: { size: 16, lineHeight: 24, weight: 500, tracking: 0.15 },
    titleSmall: { size: 14, lineHeight: 20, weight: 500, tracking: 0.1 },
    bodyLarge: { size: 16, lineHeight: 24, weight: 400, tracking: 0.5 },
    bodyMedium: { size: 14, lineHeight: 20, weight: 400, tracking: 0.25 },
    bodySmall: { size: 12, lineHeight: 16, weight: 400, tracking: 0.4 },
    labelLarge: { size: 14, lineHeight: 20, weight: 500, tracking: 0.1 },
    labelMedium: { size: 12, lineHeight: 16, weight: 500, tracking: 0.5 },
    labelSmall: { size: 11, lineHeight: 16, weight: 500, tracking: 0.5 },
  },

  // md-sys-shape (dp)
  shape: {
    none: 0,
    extraSmall: 4,
    small: 8,
    medium: 12,
    large: 16,
    extraLarge: 28,
    full: 9999,
  },

  // md-comp-* sizes and shapes, keyed by the react-native-paper element that
  // renders them (Paper's default testID, a data-testid attribute on web).
  // `height` / `width` list the allowed dp values; `shape` is a key of `shape`
  // above, or a map from height to shape key when it depends on the size.
  // `tolerance` (dp, default 0.5) absorbs where Paper itself is off the spec.
  components: {
    // Paper renders text buttons 38dp tall (it keeps the M2 label margin) and
    // outlined buttons 42dp (the 1dp border sits outside the 40dp box).
    button: { label: 'Button', selector: '[data-testid="button-container"]', height: [40], shape: 'full', tolerance: 2 },
    iconButton: { label: 'Icon button', selector: '[data-testid="icon-button-container"]', height: [40], width: [40], shape: 'full' },
    fab: {
      label: 'FAB',
      selector: '[data-testid="fab-container"]',
      height: [40, 56, 96],
      shape: { 40: 'medium', 56: 'large', 96: 'extraLarge' },
    },
    // Outlined chips are 34dp in Paper (border outside the 32dp box).
    chip: { label: 'Chip', selector: '[data-testid="chip-container"]', height: [32], shape: 'small', tolerance: 2 },
    card: { label: 'Card', selector: '[data-testid="card-container"]', shape: 'medium' },
    dialog: { label: 'Dialog', selector: '[data-testid="modal-surface"]', shape: 'extraLarge' },
    // The field's root (the outline starts 6dp lower to make room for the label).
    textField: { label: 'Text field', selector: ':has(> [data-testid="text-input-outline"]), :has(> [data-testid="text-input-underline"])', height: [56] },
    topAppBar: { label: 'Top app bar', selector: '[data-testid="appbar-header"]', height: [64] },
  },

  buttons: {
    // Horizontal space between two adjacent buttons.
    gap: 8,
    // Buttons further apart than this are not considered "adjacent".
    adjacencyThreshold: 32,
    // Max filled buttons in one group of adjacent buttons.
    maxFilledPerGroup: 1,
  },

  fab: {
    maxPerScreen: 1,
  },

  dialog: {
    minWidth: 280,
    maxWidth: 560,
    padding: 24,
    actionsAlign: 'end',
    // The parts of a dialog, as tagged by design-rules/babel-plugin-source.cjs.
    sections: ['Dialog.Title', 'Dialog.Content', 'Dialog.Actions'],
  },

  accessibility: {
    // Every interactive element needs a 48x48dp touch target that does not
    // overlap another element's target.
    touchTarget: 48,
  },

  // Window size classes and their horizontal margins.
  windowClasses: [
    { name: 'compact', maxWidth: 599, margin: 16 },
    { name: 'medium', maxWidth: 839, margin: 24 },
    { name: 'expanded', maxWidth: null, margin: 24 },
  ],

  // Allowed prop values on Paper components (checked statically by ESLint).
  allowedProps: {
    Text: {
      variant: [
        'displayLarge', 'displayMedium', 'displaySmall',
        'headlineLarge', 'headlineMedium', 'headlineSmall',
        'titleLarge', 'titleMedium', 'titleSmall',
        'bodyLarge', 'bodyMedium', 'bodySmall',
        'labelLarge', 'labelMedium', 'labelSmall',
      ],
    },
    // M3 button types: filled = "contained", tonal = "contained-tonal".
    Button: { mode: ['contained', 'contained-tonal', 'elevated', 'outlined', 'text'], compact: [false] },
    // M3 FABs: small 40, medium 56, large 96.
    FAB: { size: ['small', 'medium', 'large'] },
    // M3 text fields are 56dp tall; `dense` makes them 40.
    TextInput: { mode: ['outlined', 'flat'], dense: [false] },
    Chip: { compact: [false] },
  },

  // Components whose spec-defined dimensions/typography must not be
  // overridden via `style` (or contentStyle, labelStyle…).
  specLockedProps: ['height', 'minHeight', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'fontSize', 'lineHeight', 'fontWeight', 'letterSpacing'],
  specLockedComponents: ['Button', 'IconButton', 'FAB', 'Chip', 'Card', 'Dialog', 'TextInput', 'Appbar.Header', 'Appbar.Action', 'Searchbar', 'SegmentedButtons'],

  // Parents allowed to hold two or more sibling buttons.
  buttonGroupParents: ['ButtonRow', 'Dialog.Actions', 'Card.Actions'],
};
