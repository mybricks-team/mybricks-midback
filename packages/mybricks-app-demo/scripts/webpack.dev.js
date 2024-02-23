const path = require('path')

const commonCfg = require('./webpack.common')

module.exports = Object.assign({
  entry: {
    ['index']: path.resolve(__dirname, `../src/index.tsx`),
    ['preview']: path.resolve(__dirname, `../src/preview.tsx`),
  }
}, commonCfg)