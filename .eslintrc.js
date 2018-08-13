module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "jest/globals": true
    },
    "globals": {
        "window": true,
        "browser": true,
        "localStorage":true,
        "document": true,
        "fetch": true,
        "navigator": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:jest/recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "jest"
    ],
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ]
    }
};