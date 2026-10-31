export default {
  id: 'one-filled-button-per-group',
  description: 'A group of adjacent buttons has at most one filled (highest emphasis) button',
  check(m3, h) {
    const out = [];
    // A filled ("contained") button is the one painted in the primary color.
    const primary = h.themeColor('primary');
    if (!primary) return out;
    for (const group of h.buttonGroups(m3)) {
      const filled = group.filter(({ el }) => h.sameColor(getComputedStyle(el).backgroundColor, primary));
      if (filled.length > m3.buttons.maxFilledPerGroup) {
        for (const { el } of filled.slice(m3.buttons.maxFilledPerGroup)) {
          out.push({ el, message: `${h.describe(el)}: ${filled.length} filled buttons side by side; use contained-tonal/outlined/text for secondary actions` });
        }
      }
    }
    return out;
  },
};
