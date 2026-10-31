// Two or more sibling buttons must sit in a parent that spaces them
// (m3.buttonGroupParents), so the 8dp gap is guaranteed.
//   bad:  <View><Button/><Button/></View>
//   good: <ButtonRow><Button/><Button/></ButtonRow>

import { m3 } from '../m3.js';
import { elementName } from './utils.js';

// The <Button> a child renders, also through `{cond && <Button/>}` and `{cond ? <Button/> : …}`.
function buttonIn(child) {
  if (!child) return null;
  if (child.type === 'JSXElement') return elementName(child.openingElement) === 'Button' ? child : null;
  if (child.type === 'JSXExpressionContainer') return buttonIn(child.expression);
  if (child.type === 'LogicalExpression') return buttonIn(child.right);
  if (child.type === 'ConditionalExpression') return buttonIn(child.consequent) || buttonIn(child.alternate);
  return null;
}

export default {
  meta: {
    type: 'problem',
    docs: { description: `Sibling buttons must be wrapped in ${m3.buttonGroupParents.join(' / ')}` },
    schema: [],
  },
  create(context) {
    return {
      JSXElement(node) {
        const parent = elementName(node.openingElement);
        if (m3.buttonGroupParents.includes(parent)) return;
        const kids = node.children.filter((c) => !(c.type === 'JSXText' && !c.value.trim()));
        for (let i = 1; i < kids.length; i++) {
          if (buttonIn(kids[i]) && buttonIn(kids[i - 1])) {
            context.report({
              node: buttonIn(kids[i]),
              message: `Adjacent buttons inside <${parent}>. Wrap them in <ButtonRow> (src/components/ButtonRow.jsx) or ${m3.buttonGroupParents.slice(1).join(' / ')} to get the M3 ${m3.buttons.gap}dp gap.`,
            });
          }
        }
      },
    };
  },
};
