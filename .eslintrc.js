module.exports = {
  root: true,
  env: {
    node: true
  },
  globals: {
    'jSW': true
  },
  'extends': [
    'plugin:vue/recommended',
    '@vue/standard'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-multiple-empty-lines': 'off',
    'no-trailing-spaces': 'off',
    'vue/attributes-order': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-closing-bracket-spacing': 'off', 
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
