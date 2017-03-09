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
    ]
  }
};