module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/recommended',
    '@vue/standard'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-multiple-empty-lines': 'off',
    'no-trailing-spaces': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
