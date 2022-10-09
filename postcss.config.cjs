/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
const cssSafelistClassArray = [
  /result-section/,
  /result/,
  /result-link/,
  /clipboard-link/,
  /short-url/,
  /start-over-link/,
];

module.exports = {
  plugins: [
    require('autoprefixer'),
    require('tailwindcss'),
    require('cssnano')({
      preset: 'default',
    }),
    require('@fullhuman/postcss-purgecss')({
      content: [
        './src/index.html',
        './src/index.jsx',
        './src/components/**/*.jsx',
        './src/modules/**/*.jsx',
        './src/modules/**/**.js',
      ],
      fontFace: false,
      safelist: cssSafelistClassArray,
    }),
  ],
};
