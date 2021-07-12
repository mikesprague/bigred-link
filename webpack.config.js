const webpack = require('webpack');
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const webpackRules = [
  {
    test: /\.(sa|sc|c)ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          importLoaders: true,
          sourceMap: true,
        },
      },
      {
        loader: 'postcss-loader',
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
        },
      },
    ],
  },
  {
    test: /\.(js|jsx)$/,
    exclude: [/node_modules/, /api/, /service-worker.js/],
    use: [
      {
        loader: 'babel-loader',
      },
    ],
  },
];

const webpackPlugins = [
  new webpack.DefinePlugin({
    'process.env.BUGSNAG_KEY': JSON.stringify(process.env.BUGSNAG_KEY),
  }),
  new MiniCssExtractPlugin({
    filename: './css/styles.css',
    chunkFilename: './css/[id].[chunkhash].css',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: './static/robots.txt',
        to: './[name][ext]',
        force: true,
      },
    ],
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: './static/favicon.ico',
        to: './[name][ext]',
        force: true,
      },
    ],
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: `./static/bigredlink.webmanifest`,
        to: './[name][ext]',
        force: true,
      },
    ],
  }),
  new HtmlWebpackPlugin({
    template: './static/index.html',
    filename: './index.html',
    inject: false,
  }),
  new WorkboxPlugin.GenerateSW({
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
  }),
  new CompressionPlugin(),
];

module.exports = {
  entry: ['./src/index.js'],
  devtool: 'source-map',
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  output: {
    filename: './js/[name].js',
    chunkFilename: './js/[id].[chunkhash].js',
    path: path.resolve(__dirname, 'public'),
  },
  mode: process.env.NODE_ENV || 'production',
  module: {
    rules: webpackRules,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: webpackPlugins,
};
