module.exports = {
    verbose: true,
    // setupFiles: ['<rootDir>/jest.setup.js'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/'],
    // inlineSourceMap: true
    collectCoverageFrom: [
        'src/**/*.{js,jsx,mjs}'
    ],
    setupFiles: [
        '<rootDir>/config/polyfills.js'
    ],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,mjs}',
        '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,mjs}'
    ],
    testEnvironment: 'jsdom',
    testURL: 'http://localhost',
    transform: {
        '^.+\\.(js|jsx|mjs)$': '<rootDir>/node_modules/babel-jest',
        '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
        '^(?!.*\\.(js|jsx|mjs|css|json)$)': '<rootDir>/config/jest/fileTransform.js'
    },
    transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$'
    ],
    moduleNameMapper: {
        '^react-native$': 'react-native-web'
    },
    moduleFileExtensions: [
        'web.js',
        'js',
        'json',
        'web.jsx',
        'jsx',
        'node',
        'mjs'
    ]
}