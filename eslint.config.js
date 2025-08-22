// https://docs.expo.dev/guides/using-eslint/
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactNativePlugin = require('eslint-plugin-react-native');
const prettierPlugin = require('eslint-plugin-prettier');
const globalsPackage = require('globals');
const typescriptParser = require('@typescript-eslint/parser');
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const { node, es2021 } = globalsPackage;

const cleanGlobals = Object.fromEntries(
  Object.entries({ ...node, ...es2021 }).filter(([key]) => !/s/.test(key))
);

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  // TypeScript config
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
      globals: cleanGlobals,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
    },

    rules: {
      '@typescript-eslint/no-use-before-define': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'react/jsx-filename-extension': ['warn', { extensions: ['.ts', '.tsx'] }],
      'react/prop-types': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/no-unused-prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-native/no-raw-text': 'off',
      'react-native/sort-styles': 'off',
    },
  },

  // React & React Native config
  {
    files: ['**/*.tsx', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/jsx-filename-extension': ['warn', { extensions: ['.ts', '.tsx'] }],
      'react/prop-types': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/no-unused-prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-native/no-raw-text': 'off',
      'react-native/sort-styles': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },

  // Prettier config
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': [
        'error',
        {
          trailingComma: 'es5',
          tabWidth: 2,
          semi: true,
          singleQuote: true,
          printWidth: 100,
          bracketSpacing: true,
          arrowParens: 'always',
          endOfLine: 'auto',
        },
      ],
    },
  },

  // Global rules
  {
    ignores: ['/dist/*'],
    rules: {
      'no-shadow': 'off',
      camelcase: 'off',
      'linebreak-style': 'off',
    },
  },
]);
