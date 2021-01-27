module.exports = {
    'plugins': ['testing-library', 'jest-dom'],
    'extends': [
        'react-app',
        'react-app/jest',
        'plugin:testing-library/recommended',
        'plugin:jest-dom/recommended'
    ],
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        // 'max-len': ["error", { "code": 120, "tabWidth": 4 }],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'never'
        ]
    }
}
