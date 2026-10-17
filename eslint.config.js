import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'guidebook/**', '.claude/**'] },
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  eslintConfigPrettier,
  {
    files: ['src/shared/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*', '!@/shared', '!@/shared/**'],
              message: 'shared/ must not import from other layers (architecture.md §1)',
            },
            {
              group: ['../../*'],
              message: 'shared/ must not import from other layers (architecture.md §1)',
            },
          ],
        },
      ],
    },
  },
];
