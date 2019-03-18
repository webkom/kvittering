const webpack = require('webpack');
const path = require('path');
const loadersConf = require('./webpack.loaders');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || '3000';

module.exports = {
  mode: 'development',
  entry: './kvittering/index.js',
  devtool: process.env.WEBPACK_DEVTOOL || 'eval-source-map',
  output: {
    publicPath: '/',
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    rules: loadersConf
  },
  resolve: {
    extensions: ['.js', '.css', '.json'],
    modules: [
      path.join(__dirname, 'kvittering'),
      path.join(__dirname, 'node_modules')
    ]
  },
  devServer: {
    contentBase: './build',
    hot: true,
    inline: true,
    historyApiFallback: true,
    port: PORT,
    host: HOST,
    proxy: {
      '/kaaf': {
        target: process.env.API_URL || 'http://localhost:4000',
        pathRewrite: { '^/kaaf': '' }
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL)
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
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
