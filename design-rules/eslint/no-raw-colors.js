// Colors must come from the theme (M3 color roles), never hardcoded.
//   bad:  style={{ color: '#ff0000' }}   style={{ backgroundColor: 'red' }}
//   good: const theme = useTheme(); style={{ color: theme.colors.error }}

import { propertyKey } from './utils.js';

const RAW_COLOR = /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b|\b(?:rgb|hsl)a?\s*\(/i;
const COLOR_KEYS = new Set([
  'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
  'tintColor', 'shadowColor', 'textShadowColor', 'overlayColor', 'textDecorationColor',
  // Paper / RN component props
  'textColor', 'buttonColor', 'iconColor', 'rippleColor', 'underlineColor', 'activeUnderlineColor',
  'outlineColor', 'activeOutlineColor', 'selectionColor', 'placeholderTextColor', 'cursorColor', 'fill', 'stroke',
]);
const NAMED_COLORS = new Set(['red', 'blue', 'green', 'black', 'white', 'gray', 'grey', 'orange', 'yellow', 'purple', 'pink', 'brown', 'cyan', 'magenta']);

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow hardcoded colors; use M3 color roles from the theme' },
    schema: [],
  },
  create(context) {
    const MESSAGE = 'Use an M3 color role from the theme (const theme = useTheme(); theme.colors.primary, theme.colors.surfaceContainer…).';
    function check(node, text) {
      if (RAW_COLOR.test(text)) context.report({ node, message: `Hardcoded color "${text}". ${MESSAGE}` });
    }
    function named(node, key, value) {
      if (COLOR_KEYS.has(key) && value?.type === 'Literal' && NAMED_COLORS.has(String(value.value).toLowerCase())) {
        context.report({ node: value, message: `Named color "${value.value}". ${MESSAGE}` });
      }
    }
    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.raw);
      },
      Property(node) {
        named(node, propertyKey(node), node.value);
      },
      // <Button textColor="red">
      JSXAttribute(node) {
        named(node, node.name.name, node.value);
      },
    };
  },
};
