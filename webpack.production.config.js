var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
var WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './kvittering/index.js',
  output: {
    publicPath: './',
    path: path.join(__dirname, 'build'),
    filename: '[chunkhash].js'
  },
  module: {
    rules: loaders
  },
  resolve: {
    extensions: ['.js', '.css', '.json'],
    modules: [
      path.join(__dirname, 'kvittering'),
      path.join(__dirname, 'node_modules')
    ]
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()]
  },
  plugins: [
    new WebpackCleanupPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new HtmlWebpackPlugin({
      template: './kvittering/template.html',
      files: {
        css: ['style.css'],
        js: ['bundle.js']
      },
      inlineSource: '.(js|css)$'
    }),
    new HtmlWebpackInlineSourcePlugin()
  ]
};
