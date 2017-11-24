var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var webpack = require('webpack')
var util = require('./util')
var config = util.isDev() ? require('../config').dev : require('../config').prod
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: config.entry,
  output: config.output,
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': resolve('src'),
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      },
      {
				test: /\.css/,
				use: ExtractTextPlugin.extract({
        			fallback: 'style-loader',
        			use: ['css-loader']
     			})
			},
    ]
  },
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./manifest.dll.json'),
      context: path.resolve(__dirname, '../src/')
    }),
    new ExtractTextPlugin({
      filename: util.isDev() ? '[name].css' : '[name].[hash].css'
    }),
    new webpack.DefinePlugin({
      '__dev': util.isDev()
    }),
    new OptimizeCSSPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common'
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ].concat(
    util.genHtmlPlugin(config.htmls, config.htmlBase)
  )
}
