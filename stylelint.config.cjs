module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'theme'],
      },
    ],
    'no-descending-specificity': null,
    'no-empty-source': null,
  },
};
