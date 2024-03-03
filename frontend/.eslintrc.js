/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'next/core-web-vitals',
    'prettier',
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:tailwindcss/recommended',
  ],
  plugins: ['simple-import-sort', 'prettier', '@typescript-eslint'],
  rules: {
    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/enforces-negative-arbitrary-values': 'off',
    'react-hooks/rules-of-hooks': 'warn',
    'react/no-unescaped-entities': 'warn',
    'prettier/prettier': [
      'error',
      {
        printWidth: 130,
        endOfLine: 'auto',
        semi: true,
        singleQuote: false,
        jsxSingleQuote: false,
        trailingComma: 'es5',
        tabWidth: 2,
      },
    ],
    'no-empty-pattern': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    'sort-imports': 'off',
    'simple-import-sort/imports': [
      2,
      {
        groups: [
          [`^(${require('module').builtinModules.join('|')})(/|$)`],
          [
            // '^react',
            '^@?\\w',
          ],
          ['^@/\\w'],
          ['^components(/.*|$)'],
          ['^\\.'],
          ['^.+\\.s?css$'],
        ],
      },
    ],
  },
  settings: {
    tailwindcss: {
      callees: ['cn'],
      config: 'tailwind.config.js',
    },
  },
};
