module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: 'airbnb',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: 'babel-eslint', // needed to make babel stuff work properly
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true,
    },
  },
  plugins: ['react', 'jsx-a11y', 'import'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'arrow-parens': [2, 'as-needed', { requireForBlockBody: false }],
  },
  settings: {
    'import/resolver': {
      // 'babel-plugin-root-import': {},
      'babel-module': {},
    },
  },
};
