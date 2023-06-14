module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    camelcase: 'warn',
    'no-underscore-dangle': 'warn',
    'max-len': ['error', { code: 150 }],
    'no-nested-ternary': 'warn',
  },
};
