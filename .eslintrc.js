module.exports = {
  extends: ['airbnb-base', 'prettier', 'plugin:security/recommended'],
  plugins: ['prettier', 'promise', 'security', 'no-only-tests'],
  env: {
    es6: true,
    node: true,
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'warn',
    'no-undef': 'error',
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: 'res|next|^err',
        ignoreRestSiblings: true,
      },
    ],
    'promise/prefer-await-to-then': 'error',
    eqeqeq: ['error', 'always'],
    'no-only-tests/no-only-tests': 2,
  },
  overrides: [
    {
      files: ['test/**/*', '**/*test.js'],
      rules: {
        'no-unused-expressions': 'off',
        'security/detect-non-literal-fs-filename': 'off',
        'prefer-destructuring': 'off',
        'global-require': 'off',
      },
    },
  ],
};