const designSource = require('./design-rules/babel-plugin-source.cjs')

module.exports = function (api) {
  const platform = api.caller((caller) => caller?.platform)
  const dev = api.env() !== 'production'
  return {
    presets: ['babel-preset-expo'],
    // Tags JSX with its file:line for the rendered design checks (web dev builds only).
    plugins: platform === 'web' && dev ? [designSource] : [],
  }
}
