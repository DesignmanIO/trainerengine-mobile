module.exports = {
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalDecorators: true,
      experimentalObjectRestSpread: true,
    },
  },
  extends: 'airbnb',
  plugins: ['react', 'jsx-a11y', 'import'],
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'arrow-parens': [2, 'as-needed', { requireForBlockBody: false }],
  },
  settings: {
    'import/resolver': {
      node: {},
      'eslint-import-resolver-babel-root-import-fixed': {},
    },
  },
};
