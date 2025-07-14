module.exports = {
    root: true,
    env: {
        node: true,
        es2022: true,
        jest: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:security/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
    },
    plugins: [
        '@typescript-eslint',
        'prettier',
        'import',
        'security'
    ],
    rules: {
        // TypeScript
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-unused-vars': [
            'error',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
        ],

        // General
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'require-await': 'error',
        'no-return-await': 'error',
        'no-promise-executor-return': 'error',

        // Security
        'security/detect-object-injection': 'off',
        'security/detect-non-literal-fs-filename': 'off',

        // Import
        'import/order': [
            'error',
            {
                'groups': [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index'
                ],
                'newlines-between': 'always',
                'alphabetize': {
                    'order': 'asc',
                    'caseInsensitive': true
                }
            }
        ]
    },
    overrides: [
        {
            files: ['**/*.spec.ts', '**/*.test.ts'],
            rules: {
                '@typescript-eslint/no-unused-vars': 'off',
                'no-console': 'off'
            }
        }
    ]
};