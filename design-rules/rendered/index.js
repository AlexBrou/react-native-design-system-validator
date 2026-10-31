// Rendered rules: run in a real browser against every screen in
// src/screens/registry.js. To add a rule: create a file in this folder that
// default-exports { id, description, check(m3, h) { … } } and list it below.
//
// `check` is serialized and executed inside the page, so it can only use its
// two arguments: `m3` (design-rules/m3.js) and `h` (helpers.js). Write it as a
// method (`check(m3, h) { … }`). It returns [{ el, message }] — one entry per
// violation.
//
// Opt an element (and its subtree) out of a rule with
//   <View dataSet={{ designIgnore: 'button-gap type-scale' }}>

import buttonGap from './button-gap.js';
import componentShape from './component-shape.js';
import componentSize from './component-size.js';
import dialogLayout from './dialog-layout.js';
import oneFilledButtonPerGroup from './one-filled-button-per-group.js';
import singleFab from './single-fab.js';
import spacingGrid from './spacing-grid.js';
import touchTarget from './touch-target.js';
import typeScale from './type-scale.js';
import windowMargins from './window-margins.js';

export const rules = [
  buttonGap,
  oneFilledButtonPerGroup,
  componentSize,
  componentShape,
  typeScale,
  touchTarget,
  singleFab,
  dialogLayout,
  spacingGrid,
  windowMargins,
];
