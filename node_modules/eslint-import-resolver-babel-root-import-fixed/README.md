# eslint-import-resolver-babel-root-import-fixed

[![NPM](https://nodei.co/npm/eslint-import-resolver-babel-root-import-fixed.png)](https://nodei.co/npm/eslint-import-resolver-babel-root-import-fixed/)

A [babel-plugin-root-import](https://github.com/entwicklerstube/babel-plugin-root-import)
resolver for [eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import).

## Installation

```sh
npm install --save-dev eslint-plugin-import eslint-import-resolver-babel-root-import-fixed
```

## Usage

Inside your `.eslintrc` file, pass this resolver to `eslint-plugin-import`:
```
"settings": {
  "import/resolver": {
    "node": {},
    "eslint-import-resolver-babel-root-import-fixed": {}
  }
}
```

And see [babel-root-import][babel-root-import] to know how to configure
your prefix/suffix.

### Example

```json
{
  "xo": {
    "extends": "prettier",
    "plugins": ["prettier"],
    "parser": "babel-eslint",
    "parserOptions": {
      "sourceType": "module"
    },
    "rules": {},
    "settings": {
      "import/resolver": {
        "node": {},
        "eslint-import-resolver-babel-root-import-fixed": {}
      }
    }
  }
}
```

## License

MIT, see [LICENSE.md](/LICENSE.md) for details.


[babel-root-import]: https://github.com/michaelzoidl/babel-root-import
