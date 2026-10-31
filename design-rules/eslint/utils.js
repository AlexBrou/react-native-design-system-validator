// Small AST helpers shared by the static rules.

// Full element name: <Button> -> "Button", <Dialog.Actions> -> "Dialog.Actions".
export function elementName(openingElement) {
  return (function name(n) {
    if (n.type === 'JSXIdentifier') return n.name;
    if (n.type === 'JSXMemberExpression') return `${name(n.object)}.${n.property.name}`;
    return null;
  })(openingElement.name);
}

export function getAttribute(openingElement, name) {
  return openingElement.attributes.find(
    (a) => a.type === 'JSXAttribute' && a.name.name === name,
  );
}

// The expression inside an attribute value: `x="a"` -> Literal, `x={...}` -> expression.
export function attributeExpression(attr) {
  if (!attr || !attr.value) return null;
  if (attr.value.type === 'JSXExpressionContainer') return attr.value.expression;
  return attr.value;
}

export function propertyKey(prop) {
  if (prop.type !== 'Property') return null;
  if (prop.key.type === 'Identifier') return prop.key.name;
  if (prop.key.type === 'Literal') return String(prop.key.value);
  return null;
}

// Visit every `key: value` in an object expression, recursing into nested
// objects (transform arrays, shadowOffset…).
export function walkObject(node, visit) {
  if (!node || node.type !== 'ObjectExpression') return;
  for (const prop of node.properties) {
    const key = propertyKey(prop);
    if (key === null) continue;
    visit(key, prop.value, prop);
    walkObject(prop.value, visit);
  }
}

// `StyleSheet.create({...})` call -> its object argument.
export function styleSheetObject(node) {
  if (node?.type !== 'CallExpression') return null;
  const c = node.callee;
  const isCreate = c.type === 'MemberExpression' && c.object.name === 'StyleSheet' && c.property.name === 'create';
  return isCreate && node.arguments[0]?.type === 'ObjectExpression' ? node.arguments[0] : null;
}

// Top-level `const styles = StyleSheet.create({...})` in this file, by name.
function styleSheets(context) {
  const ast = context.sourceCode.ast;
  if (!ast.designStyleSheets) {
    ast.designStyleSheets = new Map();
    for (const stmt of ast.body) {
      const decl = stmt.type === 'ExportNamedDeclaration' ? stmt.declaration : stmt;
      if (decl?.type !== 'VariableDeclaration') continue;
      for (const d of decl.declarations) {
        const obj = styleSheetObject(d.init);
        if (obj && d.id.type === 'Identifier') ast.designStyleSheets.set(d.id.name, obj);
      }
    }
  }
  return ast.designStyleSheets;
}

// The style objects a `style` value can resolve to in this file:
// {…}, [a, b], cond && {…}, a ? b : c, styles.foo (from StyleSheet.create).
// Styles imported from other files are not followed.
export function styleObjects(context, node) {
  if (!node) return [];
  switch (node.type) {
    case 'ObjectExpression':
      return [node];
    case 'ArrayExpression':
      return node.elements.flatMap((e) => styleObjects(context, e));
    case 'LogicalExpression':
      return styleObjects(context, node.right);
    case 'ConditionalExpression':
      return [...styleObjects(context, node.consequent), ...styleObjects(context, node.alternate)];
    case 'MemberExpression': {
      const sheet = node.object.type === 'Identifier' && styleSheets(context).get(node.object.name);
      const key = node.computed ? node.property.value : node.property.name;
      const prop = sheet && sheet.properties.find((p) => propertyKey(p) === key);
      return prop?.value.type === 'ObjectExpression' ? [prop.value] : [];
    }
    default:
      return [];
  }
}

// Local names imported from a module: import { Text as RNText } from 'react-native'
// -> Map { 'RNText' => 'Text' }.
export function importedNames(context, source) {
  const names = new Map();
  for (const stmt of context.sourceCode.ast.body) {
    if (stmt.type !== 'ImportDeclaration' || stmt.source.value !== source) continue;
    for (const s of stmt.specifiers) {
      if (s.type === 'ImportSpecifier') names.set(s.local.name, s.imported.name ?? s.imported.value);
    }
  }
  return names;
}
