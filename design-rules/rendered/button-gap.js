export default {
  id: 'button-gap',
  description: 'Adjacent buttons are exactly m3.buttons.gap (8dp) apart',
  check(m3, h) {
    const out = [];
    for (const group of h.buttonGroups(m3)) {
      for (let i = 1; i < group.length; i++) {
        const gap = group[i].r.left - group[i - 1].r.right;
        if (Math.abs(gap - m3.buttons.gap) > 0.5) {
          out.push({
            el: group[i].el,
            message: `${h.describe(group[i - 1].el)} and ${h.describe(group[i].el)} are ${h.round(gap)}px apart, expected ${m3.buttons.gap}px`,
          });
        }
      }
    }
    return out;
  },
};
