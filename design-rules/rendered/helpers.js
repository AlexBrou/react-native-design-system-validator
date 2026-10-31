// Helpers available to rendered rules as `h`. This function is serialized and
// re-created inside the browser, so it must be self-contained (no imports, no
// outer variables).
//
// The app runs through react-native-web, so every View/Text is a <div>.
// Components are found by:
//   data-testid     react-native-paper's default testIDs (m3.components selectors)
//   data-component  the JSX name we wrote (<Dialog.Actions>), added by
//                   design-rules/babel-plugin-source.cjs together with data-source

export function createHelpers() {
  const h = {
    // Visible elements matching a selector (anywhere in the page, incl. dialogs).
    all(selector) {
      return [...document.querySelectorAll(selector)].filter((el) => h.visible(el));
    },

    visible(el) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const s = getComputedStyle(el);
      return s.visibility !== 'hidden' && s.display !== 'none';
    },

    // True when the element or an ancestor is fully transparent.
    transparent(el) {
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        if (getComputedStyle(n).opacity === '0') return true;
      }
      return false;
    },

    rect(el) {
      return el.getBoundingClientRect();
    },

    px(value) {
      return parseFloat(value) || 0;
    },

    round(n) {
      return Math.round(n * 10) / 10;
    },

    // "#65558f" / "rgb(101, 85, 143)" -> [101, 85, 143]
    rgb(color) {
      if (color.startsWith('#')) return [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
      return (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    },

    sameColor(a, b) {
      const x = h.rgb(a);
      const y = h.rgb(b);
      return x.length === 3 && y.length === 3 && x.every((v, i) => Math.abs(v - y[i]) <= 1);
    },

    // Theme colors the app exposes on the screen wrapper (src/App.jsx).
    themeColor(name) {
      return document.querySelector('[data-screen]')?.dataset[`${name}Color`] ?? null;
    },

    // Which m3.components spec an element matches, if any.
    componentOf(m3, el) {
      return Object.values(m3.components).find((spec) => el.matches(spec.selector)) ?? null;
    },

    // Short human label used in messages: Button "Pay now", IconButton "Decrease"
    describe(el) {
      const m3 = window.__designM3;
      const spec = m3 && h.componentOf(m3, el);
      const kind = spec?.label || el.dataset.component || el.getAttribute('role') || `<${el.tagName.toLowerCase()}>`;
      // Paper puts the accessibility label on the pressable inside the component's container.
      const label = el.getAttribute('aria-label') || (spec && el.querySelector('[aria-label]')?.getAttribute('aria-label'));
      // Icon glyphs are private-use characters; leave them out.
      // A text field's label is rendered twice (resting and floating); keep each line once.
      const inner = [...new Set((el.innerText || '').split('\n'))].join(' ');
      const text = (label || inner).replace(/[\uE000-\uF8FF]|[\u{F0000}-\u{FFFFD}]/gu, '').trim().replace(/\s+/g, ' ').slice(0, 30);
      return text ? `${kind} "${text}"` : kind;
    },

    // Icon glyphs are text in an icon font; they are not typography.
    iconFont(el) {
      return /material|icons|fontawesome|ionicons|feather|entypo/i.test(getComputedStyle(el).fontFamily);
    },

    // Elements that render their own text (have a non-empty direct text node).
    textElements() {
      return [...document.body.querySelectorAll('*')].filter(
        (el) =>
          !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName) &&
          [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()) &&
          h.visible(el) &&
          !h.transparent(el) &&
          !h.iconFont(el),
      );
    },

    // Things you can tap. A dialog's backdrop is a full-screen button; skip it.
    interactiveElements() {
      const selector = 'button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=switch], [role=checkbox], [role=radio], [role=tab], [role=menuitem], [role=option], [role=slider]';
      return h.all(selector).filter((el) => !el.matches('[data-testid$="-backdrop"]'));
    },

    windowClass(m3) {
      const w = window.innerWidth;
      return m3.windowClasses.find((c) => c.maxWidth === null || w <= c.maxWidth);
    },

    // Groups of horizontally adjacent buttons: same row, closer than the
    // adjacency threshold. Each group is sorted left to right.
    buttonGroups(m3) {
      const items = h.all(m3.components.button.selector).map((el) => ({ el, r: el.getBoundingClientRect() }));
      const rows = [];
      for (const it of items) {
        const cy = it.r.top + it.r.height / 2;
        let row = rows.find((rw) => Math.abs(rw.cy - cy) < it.r.height / 2);
        if (!row) rows.push((row = { cy, items: [] }));
        row.items.push(it);
      }
      const groups = [];
      for (const row of rows) {
        row.items.sort((a, b) => a.r.left - b.r.left);
        let group = [row.items[0]];
        for (let i = 1; i < row.items.length; i++) {
          const gap = row.items[i].r.left - row.items[i - 1].r.right;
          if (gap <= m3.buttons.adjacencyThreshold) group.push(row.items[i]);
          else {
            groups.push(group);
            group = [row.items[i]];
          }
        }
        groups.push(group);
      }
      return groups.filter((g) => g.length > 1);
    },
  };
  return h;
}
