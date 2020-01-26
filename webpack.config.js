const path = require('path');
const WebPackBar = require('webpackbar');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const purgecss = require('@fullhuman/postcss-purgecss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');

const devMode = process.env.NODE_ENV || 'production';

const config = {
  entry: [
    './src/js/main.js',
  ],
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin(),
    ],
  },
  mode: devMode,
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'js/[name].js',
  },
  module: {
    rules: [{
      test: /\.(js)$/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/env'],
        },
      }],
    },
    {
      rules: [{
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins() {
                return [
                  autoprefixer(),
                  cssnano({ preset: 'default' }),
                  purgecss({
                    content: ['./src/**/*.html'],
                    fontFace: true,
                    whitelistPatterns: [/result-section/, /result/, /short-url/],
                    whitelistPatternsChildren: [/result-section/, /result/, /short-url/],
                  }),
                ];
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      }],
    }],
  },
  plugins: [
    new WebPackBar(),
    new MiniCssExtractPlugin({
      filename: 'css/styles.css',
    }),
    new HtmlWebpackPlugin({
      inject: false,
      template: './src/index.html',
      compress: true,
    }),
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],
};

// process.noDeprecation = true;

module.exports = config;
