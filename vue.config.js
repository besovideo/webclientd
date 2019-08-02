const CopyWebpackPlugin = require('copy-webpack-plugin')// npm install --save-dev copy-webpack-plugin


module.exports = {
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  configureWebpack: config => {
    config.plugins.push(
      new CopyWebpackPlugin([
        {
          from: './static', // 新增可以被index.html访问的静态文件目录,支持多个
          to: this.outputDir,
          ignore: ['.*']
        }
      ])
    )
  },
  lintOnSave: false,
  publicPath: '',
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: undefined
}
