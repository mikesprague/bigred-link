import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import tailwindcss from 'tailwindcss';

const cssSafelistClassArray = [
  /result-section/,
  /result/,
  /result-link/,
  /clipboard-link/,
  /short-url/,
  /start-over-link/,
];

export default {
  plugins: [
    autoprefixer,
    tailwindcss,
    cssnano({
      preset: 'default',
    }),
    purgeCSSPlugin({
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
