const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

exports.genHtmlPlugin = function (htmls, htmlBase) {
    var ret = []
    for (let i in htmls) {
        ret.push(
            new HtmlWebpackPlugin(Object.assign({
                template: path.resolve(htmlBase, i),
                filename: i,
                env: process.env.NODE_ENV
            }, htmls[i]))
        )
    }
    return ret
}

exports.build = function (webpackConfig) {
    var rm = require('rimraf')
    var outputPath = webpackConfig.output.path

    return new Promise(function (resolve, reject) {
        rm(outputPath, function (err) {
            err ? reject(err) : resolve()
        })
    }).then(function () {
        return new Promise((resolve, reject) => {
            webpack(webpackConfig, function (err, stats) {
                err ? reject(err) : resolve(stats.toString({
                    colors: true,
                    modules: false,
                    children: false,
                    chunks: false,
                    chunkModules: false
                }))
            })
        })
    })
}

exports.isDev = function () {
    return process.env.NODE_ENV === 'development'
}