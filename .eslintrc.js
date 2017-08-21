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
      "warn",
      "always"
    ],
    "func-call-spacing": [
      "warn",
      "always"
    ], "block-spacing": [
      "warn",
      "always"
    ],
    "array-bracket-spacing": [
      "warn",
      "always"
    ], "keyword-spacing": [
      "warn",
      "always"
    ],
    "semi-spacing": [
      "warn",
      "always"
    ], "arrow-spacing": [
      "warn",
      "always"
    ],
    "no-tabs": [
      "warn",
      "always"
    ]


  }
};