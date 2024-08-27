const path = require('path')

const commonCfg = require('./webpack.common')

module.exports = Object.assign(
  {
    mode: 'production',
    entry: {
      // ['index']: path.resolve(__dirname, `../src/index.tsx`),
      // ['preview']: path.resolve(__dirname, `../src/preview.tsx`),
      // ['dev']: path.resolve(__dirname, `../src/dev.tsx`),
      // ['tpl']: path.resolve(__dirname, `../src/Template.tsx`),
      ['renderer']: path.resolve(__dirname, `../src/renderer/Index.tsx`),
    },
  },
  commonCfg
)
