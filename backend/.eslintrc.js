/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ["simple-import-sort", "prettier", "@typescript-eslint"],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    "sort-imports": "off",
    "simple-import-sort/imports": [
      2,
      {
        groups: [
          [`^(${require("module").builtinModules.join("|")})(/|$)`],
          ["^@?\\w"],
          ["^@/\\w"],
          ["^\\."]
        ],
      },
    ],
    "prettier/prettier": [
      "error",
      {
        printWidth: 130,
        endOfLine: "auto",
        semi: true,
        singleQuote: false,
        trailingComma: "es5",
        tabWidth: 2,
      },
    ],
  },
};
