var path = require('path')
var webpack = require('webpack')
var baseWebpackConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var config = require('../config').dll
var util = require('./util')
var UglifyJSPlugin = require('uglifyjs-webpack-plugin')

var plugins = [
  new webpack.DefinePlugin({
    '__dev': util.isDev()
  }),
  new webpack.DllPlugin({
    path: path.resolve(__dirname, './manifest.dll.json'),
    name: '[name]_library',
    context: path.resolve(__dirname, '../src/')
  })
]

if (!util.isDev()) {
  plugins.push(
    new UglifyJSPlugin({
      parallel: true,
      extractComments: true
    })
  )
}

var webpackConfig = Object.assign({}, baseWebpackConfig, {
  entry: config.entry,
  output: config.output,
  plugins: plugins,
  module: {
    rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
        exclude: /node_modules/
			},
			{
				test: /\.css/,
				use: ExtractTextPlugin.extract({
        			fallback: 'style-loader',
        			use: 'css-loader'
     			})
			}
		]
  },
})


module.exports = webpackConfig
