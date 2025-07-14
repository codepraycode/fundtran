module.exports = {
    printWidth: 100,
    tabWidth: 4,
    useTabs: true,
    semi: true,
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: false,
    trailingComma: 'all',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always',
    proseWrap: 'always',
    endOfLine: 'lf',
    overrides: [
        {
            files: '*.json',
            options: {
                printWidth: 80
            }
        },
        {
            files: '*.md',
            options: {
                proseWrap: 'preserve'
            }
        }
    ]
};