export default {
  id: 'dialog-layout',
  description: 'Dialogs are 280-560dp wide, have 24dp side insets and end-aligned actions',
  check(m3, h) {
    const out = [];
    const d = m3.dialog;
    const inDialog = (paper, name) => [...paper.querySelectorAll(`[data-component="${name}"]`)].filter((el) => h.visible(el));
    for (const paper of h.all(m3.components.dialog.selector)) {
      const pr = h.rect(paper);
      if (pr.width < d.minWidth - 0.5 || pr.width > d.maxWidth + 0.5) {
        out.push({ el: paper, message: `Dialog is ${h.round(pr.width)}px wide; M3 dialogs are ${d.minWidth}-${d.maxWidth}px` });
      }
      // Paper insets the title with margins and the content/actions with
      // padding, so measure where each section's content box starts and ends.
      for (const section of d.sections.flatMap((name) => inDialog(paper, name))) {
        const s = getComputedStyle(section);
        const r = h.rect(section);
        const inset = { left: r.left + h.px(s.paddingLeft) - pr.left, right: pr.right - (r.right - h.px(s.paddingRight)) };
        for (const side of ['left', 'right']) {
          if (Math.abs(inset[side] - d.padding) > 0.5) {
            out.push({ el: section, message: `${section.dataset.component} is ${h.round(inset[side])}px from the dialog's ${side} edge; M3 dialogs use ${d.padding}px` });
          }
        }
      }
      for (const actions of inDialog(paper, 'Dialog.Actions')) {
        const buttons = h.all(m3.components.button.selector).filter((b) => actions.contains(b));
        if (!buttons.length) continue;
        const contentRight = h.rect(actions).right - h.px(getComputedStyle(actions).paddingRight);
        const lastRight = Math.max(...buttons.map((b) => h.rect(b).right));
        if (Math.abs(contentRight - lastRight) > 1) {
          out.push({ el: actions, message: `Dialog actions are not aligned to the end (last button ends ${h.round(contentRight - lastRight)}px early)` });
        }
      }
    }
    return out;
  },
};
