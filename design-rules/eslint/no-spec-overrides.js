// Spec-defined dimensions, shapes and typography of M3 components come from
// the theme and must not be overridden per screen.
//   bad:  <Button style={{ borderRadius: 4, height: 36 }}>   <FAB customSize={48}>
//   good: <Button>   (or change the token in m3.js for everyone)

import { m3 } from '../m3.js';
import { attributeExpression, elementName, styleObjects, walkObject } from './utils.js';

const LOCKED = new Set(m3.specLockedProps);
const STYLE_ATTRS = new Set(['style', 'contentStyle', 'labelStyle', 'textStyle', 'outlineStyle', 'underlineStyle', 'titleStyle']);
// Props that set a size outside the M3 scale.
const SIZE_ATTRS = { FAB: 'customSize', 'AnimatedFAB': 'customSize' };

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow overriding M3 spec values (size, shape, type) on design-system components' },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const component = elementName(node);
        if (!m3.specLockedComponents.includes(component)) return;
        for (const attr of node.attributes) {
          if (attr.type !== 'JSXAttribute') continue;
          if (SIZE_ATTRS[component] === attr.name.name) {
            context.report({ node: attr, message: `${attr.name.name} on <${component}> is outside the M3 sizes. Use size="small" | "medium" | "large".` });
            continue;
          }
          if (!STYLE_ATTRS.has(attr.name.name)) continue;
          for (const obj of styleObjects(context, attributeExpression(attr))) {
            walkObject(obj, (key, _value, prop) => {
              if (LOCKED.has(key)) {
                context.report({
                  node: prop,
                  message: `"${key}" of <${component}> is defined by the M3 spec. Don't override it per screen; change design-rules/m3.js instead.`,
                });
              }
            });
          }
        }
      },
    };
  },
};
