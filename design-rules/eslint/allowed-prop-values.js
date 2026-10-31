// Only M3 variants/sizes may be used (table in m3.js -> allowedProps).
//   bad:  <TextInput dense>   <Button compact>   <Button mode="contained" compact>
//   good: <TextInput mode="outlined">   <Button mode="contained-tonal">   <FAB size="small">

import { m3 } from '../m3.js';
import { attributeExpression, elementName } from './utils.js';

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Restrict component props to the M3 values listed in m3.allowedProps' },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const component = elementName(node);
        const rules = m3.allowedProps[component];
        if (!rules) return;
        for (const attr of node.attributes) {
          if (attr.type !== 'JSXAttribute') continue;
          const allowed = rules[attr.name.name];
          if (!allowed) continue;
          // `<TextInput dense>` is `dense={true}`.
          const expr = attr.value ? attributeExpression(attr) : { type: 'Literal', value: true };
          if (!expr || expr.type !== 'Literal') continue;
          if (!allowed.includes(expr.value)) {
            const shown = typeof expr.value === 'string' ? `${attr.name.name}="${expr.value}"` : attr.name.name;
            context.report({
              node: attr,
              message: allowed.length === 1 && allowed[0] === false
                ? `<${component} ${shown}> changes the M3 size of the component. Remove it.`
                : `<${component} ${shown}> is not an M3 value. Allowed: ${allowed.join(', ')}.`,
            });
          }
        }
      },
    };
  },
};
