/* eslint-disable global-require */
const colors = require('tailwindcss/colors');

module.exports = {
  purge: {
    content: ['./static/index.html', './src/components/**/*.js'],
  },
  darkMode: false,
  theme: {
    colors: {
      amber: colors.amber,
      black: '#000',
      blue: colors.blue,
      bluegray: colors.blueGray,
      coolgray: colors.coolGray,
      cyan: colors.cyan,
      emerald: colors.emerald,
      gray: colors.gray,
      green: colors.green,
      indigo: colors.indigo,
      sky: colors.sky,
      lime: colors.lime,
      orange: colors.orange,
      pink: colors.pink,
      purple: colors.purple,
      red: '#b31b1b',
      rose: colors.rose,
      teal: colors.teal,
      truegray: colors.trueGray,
      violet: colors.violet,
      warmgray: colors.warmGray,
      white: '#fff',
      yellow: colors.yellow,
    },
    extend: {
      colors: {
        'blue-links': '#006699',
        carnellian: '#b31b1b',
        'dark-grey': '#222',
        'dark-warm-grey': '#073949',
        'green-graphics': '#6eb43f',
        'green-large-text': '#578e32',
        'light-grey': '#f7f7f7',
        'med-grey': '#bbb',
        navy: '#073949',
        'orange-graphics': '#f8981d',
        'orange-large-text': '#d47500',
        'red-graphics': '#ef4035',
        'red-text': '#df1e12',
        'reen-text': '#4b7b2b',
        'sea-grey': '#9fad9f',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};
