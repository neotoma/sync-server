module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "mocha": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "indent": [
      "warn",
      2
    ],
    "linebreak-style": [
      "warn",
      "unix"
    ],
    "no-control-regex": [
      "off"
    ],
    "no-irregular-whitespace": [
      "warn"
    ],
    "quotes": [
      "warn",
      "single"
    ],
    "semi": [
      "warn",
      "always"
    ],
    "key-spacing": [
      "error"
    ],
    "func-call-spacing": [
      "error",
      "never"
    ], "block-spacing": [
      "error"
    ],
    "array-bracket-spacing": [
      "error"
    ], "keyword-spacing": [
      "error"
    ],
    "semi-spacing": [
      "error"
    ], "arrow-spacing": [
      "error"
    ],
    "no-tabs": [
      "error"
    ],
    "space-before-function-paren": [
      "error",
      "never"
    ],"no-multiple-empty-lines": [
      "error",
      { "max": 1 }
    ],"padded-blocks": [
      "error",
      "never"
    ],"padding-line-between-statements": [
      "error",
      { "blankLine": "always", "prev": "*", "next": "if" },
    ],"sort-imports": [
      "error"
    ],"comma-dangle": [
      "error",
      "never"
    ],"object-curly-spacing": [
      "error",
      "always"
    ]
  }
};