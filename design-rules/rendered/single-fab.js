export default {
  id: 'single-fab',
  description: 'At most m3.fab.maxPerScreen FAB is visible on a screen',
  check(m3, h) {
    const fabs = h.all(m3.components.fab.selector);
    return fabs.slice(m3.fab.maxPerScreen).map((el) => ({
      el,
      message: `${fabs.length} FABs on screen; M3 allows ${m3.fab.maxPerScreen} (the FAB is the screen's single primary action)`,
    }));
  },
};
