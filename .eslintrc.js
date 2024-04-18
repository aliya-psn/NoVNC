module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es6: true
    },
    extends: ['plugin:vue/recommended', 'eslint:recommended', 'plugin:prettier/recommended'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2021,
        parser: 'babel-eslint',
        sourceType: 'module'
    },
    plugins: ['vue', 'prettier'],
    rules: {
        'prettier/prettier': [
            'error',
            {
                printWidth: 120, // 超过最大值换行
                endOfLine: 'auto',
                singleQuote: true, // 使用单引号
                semi: false, // 不加分号
                trailingComma: 'none', // 去除末尾逗号
                arrowParens: 'avoid', // 箭头函数单独参数不加括号
                bracketSameLine: true,
                bracketSpacing: true // 对象，数组括号和文字之间加空格
            }
        ],
        'vue/attributes-order': 'off'
    }
}
