var resolve = require('path').resolve

const port = 8080
const base = {
    htmlBase: resolve(__dirname, '../src/html'),
    htmls: {
        'page1.html': {
            chunks: ['common', 'page1']
        },
        'page2.html': {
            chunks: ['common','page2']
        }
    },
    entry: {
        page1: './src/page1/index.js',
        page2: './src/page2/index.js'
    }
}

const dev = Object.assign({}, base, {
    port: port,
    openBrowser: false,
    defaultPage: `http://localhost:${port}/page1.html`,
    proxyTable: {},
    output: {
        path: resolve(__dirname, '..'),
        filename: '[name].js',
        publicPath: '/'
    }
})

const prod = {
    entry: {
        dammo: './src/page1/Damoo.js'
    },
    output: {
        path: resolve(__dirname, '../dist'),
        filename: '[name].js',
        publicPath: './',
        library: 'Damoo',
        libraryTarget: 'umd',
        umdNamedDefine: true
    }
}

const dll = {
    entry: {
        common: ['./src/common/index.js']
    },
    output: {
        path: resolve(__dirname, '../dll'),
        filename: '[name].dll.js',
        library: '[name]_library',
        publicPath: '/'
    }
}

module.exports = {
    dev,
    prod,
    base,
    dll
}