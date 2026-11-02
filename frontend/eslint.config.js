const { defineConfig } = require('eslint/config');
const globals = require('globals');
const expoConfig = require('eslint-config-universe/flat/native');

module.exports = defineConfig([
  ...expoConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'prettier/prettier': 'off',
    },
  },
  {
    files: ['app/perfil.js', 'app/vagas.js'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
]);
