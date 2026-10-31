export default {
  id: 'component-shape',
  description: 'Components use the M3 corner radius (md-sys-shape) in m3.components',
  check(m3, h) {
    const out = [];
    for (const spec of Object.values(m3.components)) {
      if (!spec.shape) continue;
      for (const el of h.all(spec.selector)) {
        const r = h.rect(el);
        const tolerance = spec.tolerance ?? 0.5;
        const shapeKey = typeof spec.shape === 'string'
          ? spec.shape
          : Object.entries(spec.shape).find(([height]) => Math.abs(height - r.height) <= tolerance)?.[1];
        if (!shapeKey) continue; // size is wrong; component-size reports it
        const maxRadius = Math.min(r.width, r.height) / 2;
        const raw = getComputedStyle(el).borderTopLeftRadius;
        const declared = raw.endsWith('%') ? (h.px(raw) / 100) * Math.min(r.width, r.height) : h.px(raw);
        const actual = Math.min(declared, maxRadius);
        const expected = Math.min(m3.shape[shapeKey], maxRadius);
        if (Math.abs(actual - expected) > tolerance) {
          out.push({ el, message: `${h.describe(el)} has ${h.round(actual)}px corners; M3 ${spec.label} uses "${shapeKey}" (${h.round(expected)}px)` });
        }
      }
    }
    return out;
  },
};
