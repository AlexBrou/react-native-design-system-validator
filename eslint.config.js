import globals from 'globals'
import { designRulesConfig } from './design-rules/eslint/index.js'

export default [
  { ignores: ['dist', '.design-report', '.expo', 'web-build'] },
  {
    files: ['**/*.{js,jsx,cjs}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // Material Design 3 rules — see design-rules/
  designRulesConfig,
]
