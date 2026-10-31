export default {
  id: 'component-size',
  description: 'Components render at the M3 heights/widths in m3.components',
  check(m3, h) {
    const out = [];
    for (const spec of Object.values(m3.components)) {
      for (const el of h.all(spec.selector)) {
        const r = h.rect(el);
        const tolerance = spec.tolerance ?? 0.5;
        for (const dim of ['height', 'width']) {
          if (!spec[dim]) continue;
          const actual = h.round(r[dim]);
          if (!spec[dim].some((v) => Math.abs(v - actual) <= tolerance)) {
            out.push({ el, message: `${h.describe(el)} is ${actual}px ${dim === 'height' ? 'tall' : 'wide'}; M3 ${spec.label} allows ${spec[dim].join(' / ')}px` });
          }
        }
      }
    }
    return out;
  },
};
