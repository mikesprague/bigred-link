/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
const cssSafelistClassArray = [
  /result-section/,
  /result/,
  /result-link/,
  /clipboard-link/,
  /short-url/,
];

const purgecss = require('@fullhuman/postcss-purgecss')({
  // Specify the paths to all of the template files in your project
  content: ['./src/**/*.html'],
  fontFace: true,
  safelist: cssSafelistClassArray,
});

// Export all plugins our postcss should use
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default',
    }),
    [purgecss],
    // ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
  ],
};
