var path = require('path')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var UglifyJSPlugin = require('uglifyjs-webpack-plugin')

var plugins = [
    new UglifyJSPlugin({
      parallel: true,
      extractComments: true
    })
]

var webpackConfig = merge(baseWebpackConfig, {
  devtool: false,
  plugins: plugins
})

module.exports = webpackConfig
