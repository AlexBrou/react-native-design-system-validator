export default {
  id: 'type-scale',
  description: 'All visible text uses an M3 type scale role (size / line height / weight)',
  check(m3, h) {
    const out = [];
    const roles = Object.entries(m3.typeScale);
    // Paper draws text-field labels itself (scaled while floating, line height
    // fixed to 1.2× on web); a screen cannot change them.
    const PAPER_LABEL = '[data-testid$="-label-active"], [data-testid$="-label-inactive"]';
    for (const el of h.textElements()) {
      if (el.closest(PAPER_LABEL)) continue;
      const s = getComputedStyle(el);
      const size = h.px(s.fontSize);
      const lineHeight = s.lineHeight === 'normal' ? null : h.px(s.lineHeight);
      const weight = Number(s.fontWeight);
      const match = roles.find(([, t]) => Math.abs(t.size - size) < 0.5 && lineHeight !== null && Math.abs(t.lineHeight - lineHeight) < 0.5 && t.weight === weight);
      if (!match) {
        const sameSize = roles.filter(([, t]) => Math.abs(t.size - size) < 0.5).map(([name]) => name);
        const hint = sameSize.length ? ` (closest: ${sameSize.join(' / ')})` : '';
        out.push({ el, message: `${h.describe(el)} is ${h.round(size)}px/${lineHeight === null ? 'normal' : h.round(lineHeight) + 'px'} weight ${weight}, not an M3 type role${hint}` });
      }
    }
    return out;
  },
};
