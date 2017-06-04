var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + '/app/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {

  entry: {
    "app_bundle":"./app/main.js"
  },

  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  plugins: [
    HTMLWebpackPluginConfig,
    new CopyWebpackPlugin([
      { from: 'js/vendor/modernizr-2.8.3.min.js', to: 'js/'},
      { from: 'node_modules/tingle.js/dist/tingle.min.js', to: 'js/'},
      { from: 'node_modules/holmes.js/js/holmes.js', to: 'js/'},
      { from: 'node_modules/mustache/mustache.min.js', to: 'js/'},
      { from: 'js/vendor/tinysort.min.js', to: 'js/'},
      { from: 'css/normalize.min.css', to: 'css/'},
      { from: 'node_modules/tingle.js/dist/tingle.min.css', to: 'css/'},
      { from: 'css/', to: 'css/'}
    ]),
    new HtmlWebpackIncludeAssetsPlugin({ assets: [
      'js/modernizr-2.8.3.min.js',
      'js/tingle.min.js',
      'js/holmes.js',
      'js/mustache.min.js',
      'js/tinysort.min.js',
      'css/normalize.min.css',
      'css/tingle.min.css',
      'css/MyFontsTradeGothic.css',
      'css/main.css'
    ], append: true })

  ]


};
