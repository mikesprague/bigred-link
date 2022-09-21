/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable node/no-unpublished-import */
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { version } from './package.json';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../build',
    sourcemap: '',
  },
  publicDir: '../public',
  base: './',
  outDir: './',
  appType: 'spa',
  plugins: [
    VitePWA({
      strategies: 'generateSW',
      injectRegister: 'auto',
      registerType: 'prompt',
      filename: 'service-worker.js',
      manifestFilename: 'bigred-link.webmanifest',
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /\/\w{7}/],
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
      },
      includeAssets: [
        './images/icon-32.png',
        './images/icon-64.png',
        './images/icon-128.png',
      ],
      manifest: {
        version,
        name: 'BigRed.link | URL Shortener',
        short_name: 'BigRed.link',
        description: 'A big red URL shortener',
        icons: [
          {
            src: '/images/icon-16.png',
            type: 'image/png',
            sizes: '16x16',
          },
          {
            src: '/images/icon-24.png',
            type: 'image/png',
            sizes: '24x24',
          },
          {
            src: '/images/icon-32.png',
            type: 'image/png',
            sizes: '32x32',
          },
          {
            src: '/images/icon-48.png',
            type: 'image/png',
            sizes: '48x48',
          },
          {
            src: '/images/icon-64.png',
            type: 'image/png',
            sizes: '64x64',
          },
          {
            src: '/images/icon-128.png',
            type: 'image/png',
            sizes: '128x128',
          },
          {
            src: '/images/icon-192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'any',
          },
          {
            src: '/images/icon-192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'maskable',
          },
          {
            src: '/images/icon-256.png',
            type: 'image/png',
            sizes: '256x256',
          },
          {
            src: '/images/icon-512.png',
            type: 'image/png',
            sizes: '512x512',
          },
        ],
        homepage_url: 'https://bigred.link/',
        scope: '/',
        start_url: '/',
        display: 'standalone',
        background_color: '#b31b1b',
        theme_color: '#222',
      },
    }),
    react({
      include: '**/*.{jsx,js}',
    }),
  ],
});
