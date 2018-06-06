module.exports = {
  parserOptions : {
    ecmaVersion  : 6,
    sourceType   : "module",
    ecmaFeatures : {
      jsx: true,
      modules: true, 
    }
  },
  extends: "airbnb",
  plugins: [
      "react",
      "jsx-a11y",
      "import"
  ],
  rules: {
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }]
  },
  settings: {
    "import/resolver": {
      "babel-module": {}
    }
  }
};