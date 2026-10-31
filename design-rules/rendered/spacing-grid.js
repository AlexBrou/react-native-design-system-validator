export default {
  id: 'spacing-grid',
  description: 'Layout padding, gaps and the margins between laid-out items are multiples of m3.grid (4dp)',
  check(m3, h) {
    const out = [];
    // Elements we wrote that are pure layout (data-component comes from the
    // Babel plugin). Paper components have their internal spacing defined by
    // their own spec (e.g. button padding), so only their outer margins are checked.
    const LAYOUT = new Set([
      'View', 'ScrollView', 'SafeAreaView', 'KeyboardAvoidingView', 'Surface',
      'Page', 'ButtonRow', 'Card.Content', 'Card.Actions', 'Dialog.Content', 'Dialog.Actions',
    ]);
    const off = (v) => Math.abs(v / m3.grid - Math.round(v / m3.grid)) > 0.01;
    // One violation per element, listing every off-grid property.
    const seen = { paddingTop: new Set(), marginTop: new Set() };
    const report = (el, props) => {
      if (seen[props[0]].has(el)) return;
      seen[props[0]].add(el);
      const style = getComputedStyle(el);
      const bad = props.filter((p) => off(h.px(style[p]))).map((p) => `${p} ${h.round(h.px(style[p]))}px`);
      if (bad.length) out.push({ el, message: `${h.describe(el)} has ${bad.join(', ')}, not on the ${m3.grid}dp grid` });
    };
    for (const el of h.all('[data-component]')) {
      if (!LAYOUT.has(el.dataset.component)) continue;
      // A ScrollView's contentContainerStyle lands on its first child.
      const boxes = el.dataset.component === 'ScrollView' && el.firstElementChild ? [el, el.firstElementChild] : [el];
      for (const box of boxes) {
        report(box, ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap']);
        for (const child of box.children) {
          if (h.visible(child)) report(child, ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']);
        }
      }
    }
    return out;
  },
};
