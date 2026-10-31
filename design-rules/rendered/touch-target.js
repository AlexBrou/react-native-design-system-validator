export default {
  id: 'touch-target',
  description: 'Every interactive element has a 48x48dp touch target that does not overlap another one',
  check(m3, h) {
    const out = [];
    const size = m3.accessibility.touchTarget;
    const targets = h.interactiveElements().map((el) => {
      const r = h.rect(el);
      const w = Math.max(r.width, size);
      const ht = Math.max(r.height, size);
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      return { el, left: cx - w / 2, right: cx + w / 2, top: cy - ht / 2, bottom: cy + ht / 2 };
    });
    for (let i = 0; i < targets.length; i++) {
      for (let j = i + 1; j < targets.length; j++) {
        const a = targets[i];
        const b = targets[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 0.5 && oy > 0.5) {
          out.push({ el: b.el, message: `${h.describe(a.el)} and ${h.describe(b.el)} have overlapping ${size}x${size} touch targets (${h.round(Math.min(ox, oy))}px overlap)` });
        }
      }
    }
    return out;
  },
};
