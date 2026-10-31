export default {
  id: 'window-margins',
  description: 'Content keeps the M3 window margin from the screen edges (16dp compact, 24dp medium/expanded)',
  check(m3, h) {
    const out = [];
    const wc = h.windowClass(m3);
    const vw = document.documentElement.clientWidth;
    // Full-bleed surfaces manage their own insets.
    const FULL_BLEED = '[data-testid="appbar-header"], [data-testid="modal"], [data-testid="snackbar"], [data-component="List.Item"], [data-component="Appbar.Header"], [data-full-bleed]';
    const s = m3.components;
    const candidates = new Set([
      ...h.textElements(),
      ...h.all([s.button, s.fab, s.chip, s.card, s.textField].map((c) => c.selector).join(', ')),
    ]);
    for (const el of candidates) {
      if (el.closest(FULL_BLEED)) continue;
      const r = h.rect(el);
      const left = r.left;
      const right = vw - r.right;
      if (left < wc.margin - 0.5 || right < wc.margin - 0.5) {
        out.push({ el, message: `${h.describe(el)} is ${h.round(Math.min(left, right))}px from the screen edge; ${wc.name} windows need ${wc.margin}px` });
      }
    }
    return out;
  },
};
