"use strict";
const webpack = require("webpack");
const path = require("path");
const loadersConf = require("./webpack.loaders");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const HOST = process.env.HOST || "127.0.0.1";
const PORT = process.env.PORT || "3000";

module.exports = {
  entry: [
    "core-js/fn/promise",
    "core-js/es6/object",
    "core-js/es6/array",

    "./kvittering/index.js" // your app's entry point
  ],
  devtool: process.env.WEBPACK_DEVTOOL || "eval-source-map",
  output: {
    publicPath: "/",
    path: path.join(__dirname, "build"),
    filename: "bundle.js"
  },
  module: {
    rules: loadersConf
  },
  resolve: {
    extensions: [".js", ".jsx"],
    modules: [
      path.join(__dirname, "kvittering"),
      path.join(__dirname, "node_modules")
    ],
    alias: {
      styles: path.resolve(__dirname, "styles/")
    }
  },
  devServer: {
    contentBase: "./build",
    hot: true,
    inline: true,
    historyApiFallback: true,
    port: PORT,
    host: HOST,
    proxy: {
      "/kaaf": {
        target: process.env.API_URL || "http://localhost:4000",
        pathRewrite: { "^/kaaf": "" }
      }
    }
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({
      filename: "style.css",
      allChunks: true
    }),
    new DashboardPlugin(),
    new HtmlWebpackPlugin({
      template: "./kvittering/template.html",
      files: {
        css: ["style.css"],
        js: ["bundle.js"]
      },
      inlineSource: '.(js|css)$'
    }),
    new HtmlWebpackInlineSourcePlugin()
  ]
};
