// Spacing must be a dp number on the M3 4dp grid.
//   bad:  style={{ gap: 6 }}   style={{ marginTop: '13px' }}   StyleSheet.create({ a: { padding: 10 } })
//   good: style={{ gap: 8 }}   style={{ marginTop: 12 }}       StyleSheet.create({ a: { padding: 16 } })

import { m3 } from '../m3.js';
import { attributeExpression, styleSheetObject, walkObject } from './utils.js';

const SPACING_KEYS = new Set([
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'marginHorizontal', 'marginVertical',
  'marginStart', 'marginEnd', 'marginBlock', 'marginInline',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'paddingHorizontal', 'paddingVertical',
  'paddingStart', 'paddingEnd', 'paddingBlock', 'paddingInline',
  'gap', 'rowGap', 'columnGap',
]);

export default {
  meta: {
    type: 'problem',
    docs: { description: `Spacing must be a dp number on the ${m3.grid}dp grid` },
    schema: [],
  },
  create(context) {
    function checkValue(node) {
      if (!node) return;
      if (node.type === 'UnaryExpression' && node.operator === '-') return checkValue(node.argument);
      if (node.type === 'ConditionalExpression') return [node.consequent, node.alternate].forEach(checkValue);
      if (node.type !== 'Literal') return;

      if (typeof node.value === 'number') {
        if (Math.abs(node.value / m3.grid - Math.round(node.value / m3.grid)) > 1e-9) {
          context.report({ node, message: `Spacing ${node.value}dp is off the ${m3.grid}dp grid. Use a multiple of ${m3.grid}.` });
        }
      } else if (typeof node.value === 'string' && /\d/.test(node.value)) {
        context.report({ node, message: `Raw spacing "${node.value}". Use a dp number on the ${m3.grid}dp grid.` });
      }
    }
    const checkObject = (obj) =>
      walkObject(obj, (key, value) => {
        if (SPACING_KEYS.has(key)) checkValue(value);
      });
    // Inline objects inside a style value: {…}, [a, {…}], cond && {…}
    function checkInline(node) {
      if (!node) return;
      if (node.type === 'ObjectExpression') checkObject(node);
      else if (node.type === 'ArrayExpression') node.elements.forEach(checkInline);
      else if (node.type === 'LogicalExpression') checkInline(node.right);
      else if (node.type === 'ConditionalExpression') [node.consequent, node.alternate].forEach(checkInline);
    }

    return {
      // Every StyleSheet.create in src/, wherever it is used.
      CallExpression(node) {
        checkObject(styleSheetObject(node));
      },
      JSXAttribute(attr) {
        const name = attr.name.name;
        const expr = attributeExpression(attr);
        if (SPACING_KEYS.has(name)) checkValue(expr);
        if (typeof name === 'string' && /^(style|\w+Style)$/.test(name)) checkInline(expr);
      },
    };
  },
};
