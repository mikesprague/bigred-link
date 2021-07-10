const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const mode = process.env.NODE_ENV;

const webpackRules = [
  {
    test: /\.(sa|sc|c)ss$/,
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
    test: /\.(js)$/,
    exclude: [/node_modules/],
    use: [
      {
        loader: 'babel-loader',
      },
    ],
  },
];

const webpackPlugins = [
  new MiniCssExtractPlugin({
    filename: './css/styles.css',
    chunkFilename: './css/[id].[chunkhash].css',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: './src/*.html',
        to: './[name][ext]',
        force: true,
      },
    ],
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: './src/robots.txt',
        to: './[name][ext]',
        force: true,
      },
    ],
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: './src/favicon.ico',
        to: './[name][ext]',
        force: true,
      },
    ],
  }),
];

if (mode === 'production') {
  webpackPlugins.push(new CompressionPlugin());
}

module.exports = {
  entry: ['./src/js/main.js'],
  devtool: 'source-map',
  output: {
    filename: './js/[name].js',
    chunkFilename: './js/[id].[chunkhash].js',
    path: path.resolve(__dirname, 'public'),
  },
  mode,
  module: {
    rules: webpackRules,
  },
  devServer: {
    contentBase: path.join(__dirname, './'),
    open: false,
    port: 4000,
    publicPath: 'http://localhost:4000/',
    stats: 'minimal',
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
