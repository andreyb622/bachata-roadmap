import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';

const DEEP_MODULE_IMPORT = '@/modules/*/**';

const moduleBlock = (name, allowed) => ({
  files: [`src/modules/${name}/**/*.{ts,vue}`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/app', '@/app/**', '@/pages', '@/pages/**'],
            message: 'modules must not import app/ or pages/ (architecture.md §1).',
          },
          {
            group: [DEEP_MODULE_IMPORT],
            message: 'Import another module only via its index.ts (architecture.md §2).',
          },
          {
            group: ['@/modules/*', ...allowed.map((target) => `!@/modules/${target}`)],
            message: 'Module edge is not allowed (architecture.md §4).',
          },
        ],
      },
    ],
  },
});

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
  {
    files: ['src/pages/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app', '@/app/**'],
              message: 'pages/ must not import app/ (architecture.md §1).',
            },
            {
              group: [DEEP_MODULE_IMPORT],
              message: 'Import a module only via its index.ts (architecture.md §2).',
            },
          ],
        },
      ],
    },
  },
  moduleBlock('*', []),
  moduleBlock('program', []),
  moduleBlock('profiles', ['program']),
  moduleBlock('search', ['program']),
  moduleBlock('settings', []),
  moduleBlock('elements', []),
  moduleBlock('pwa', []),
  {
    files: ['src/app/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [DEEP_MODULE_IMPORT],
              message: 'Import a module only via its index.ts (architecture.md §2).',
            },
          ],
        },
      ],
    },
  },
];
