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

const purgecss = require('@fullhuman/postcss-purgecss')({
  // Specify the paths to all of the template files in your project
  content: ['./static/index.html', './src/components/**/*.js'],
  fontFace: false,
  safelist: cssSafelistClassArray,
});

// Export all plugins our postcss should use
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('tailwindcss'),
    require('cssnano')({
      preset: 'default',
    }),
    [purgecss],
    // ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
  ],
};
