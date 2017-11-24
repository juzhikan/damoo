var webpackConf = require('./webpack.dll.conf')
var util = require('./util')

util.build(webpackConf).then(function (str) {
	console.log(str)
}).catch(err => {
	console.log(err.message)
})