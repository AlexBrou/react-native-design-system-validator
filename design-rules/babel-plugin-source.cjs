// Dev-only Babel plugin (web builds only, registered in /babel.config.cjs):
// stamps every JSX element in src/ with the place it is written and its name,
// e.g. <Button dataSet={{ source: "src/screens/Checkout.jsx:37:11", component: "Button" }}>.
// react-native-web renders dataSet as data-* attributes, and the rendered
// checks read them to report the file and line of each violation.
// An inline dataSet={{ … }} (e.g. designIgnore) gets the two keys added to it.

const path = require('node:path')

function elementName(name) {
  if (name.type === 'JSXIdentifier') return name.name
  if (name.type === 'JSXMemberExpression') return `${elementName(name.object)}.${name.property.name}`
  return ''
}

module.exports = function designSource({ types: t }) {
  return {
    name: 'design-rules-source',
    visitor: {
      JSXOpeningElement(p, state) {
        const file = state.filename
        if (!file || file.includes('/node_modules/')) return
        const rel = path.relative(state.cwd, file)
        if (!rel.startsWith('src/')) return
        const name = elementName(p.node.name)
        // Lowercase names are DOM tags (they shouldn't be here; no-native-controls reports them).
        if (!name || /(^|\.)Fragment$/.test(name) || /^[a-z]/.test(name)) return
        const { line, column } = p.node.loc.start
        const props = [
          t.objectProperty(t.identifier('source'), t.stringLiteral(`${rel}:${line}:${column + 1}`)),
          t.objectProperty(t.identifier('component'), t.stringLiteral(name)),
        ]
        const existing = p.node.attributes.find((a) => a.type === 'JSXAttribute' && a.name.name === 'dataSet')
        if (!existing) {
          p.node.attributes.push(t.jsxAttribute(t.jsxIdentifier('dataSet'), t.jsxExpressionContainer(t.objectExpression(props))))
          return
        }
        // dataSet={{ designIgnore: '…' }}: add ours to it. A dataSet built elsewhere is left alone.
        const value = existing.value?.expression
        if (value?.type === 'ObjectExpression' && !value.properties.some((q) => q.key?.name === 'source')) value.properties.push(...props)
      },
    },
  }
}
