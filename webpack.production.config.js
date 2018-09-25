var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
var WebpackCleanupPlugin = require('webpack-cleanup-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

loaders.push({
  test: /\.scss$/,
  loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?sourceMap&localIdentName=[local]___[hash:base64:5]!sass-loader?outputStyle=expanded'}),
  exclude: ['node_modules']
});

module.exports = {
  entry: [
    './kvittering/index.js'
  ],
  output: {
    publicPath: './',
    path: path.join(__dirname, 'build'),
    filename: '[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      "styles": path.resolve(__dirname, 'styles/'),
    }
  },
  module: {
    loaders
  },
  plugins: [
    new WebpackCleanupPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        drop_console: true,
        drop_debugger: true
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin({
      filename: 'style.css',
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: './kvittering/template.html',
      files: {
        css: ['style.css'],
        js: ['bundle.js'],
      },
      inlineSource: '.(js|css)$'
    }),
    new HtmlWebpackInlineSourcePlugin()
  ]
};
