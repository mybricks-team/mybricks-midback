const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const CopyPlugin = require('copy-webpack-plugin')
const VeauryVuePlugin = require('veaury/webpack/VeauryVuePlugin')

const outputType = process.env.OUTPUT_TYPE

module.exports = {
  mode: 'production',
  entry:
    outputType === 'esm'
      ? {
        index: './src/index.tsx',
        toVue: './src/toVue/index.vue',
        version: './src/version/index.ts',
      }
      : {
        index: './src/index.tsx',
        toVue: './src/toVue/index.vue',
        version: './src/version/index.ts',
      },

  output:
    outputType === 'esm'
      ? // ESM
      {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].esm.js',
        library: {
          type: 'module',
        },
        chunkFormat: 'module',
      }
      : // UMD
      {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].js',
        library: {
          name: 'rendererPc',
          type: 'umd',
          export: 'default',
        },
        globalObject: 'globalThis',
      },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: [
    {
      react: 'react',
      'react-dom': 'react-dom',
      vue: 'vue',
    },
  ],
  experiments: {
    outputModule: outputType === 'esm',
  },
  module: {
    rules: [
      {
        test: /.(ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]], // 装饰器
          },
        },
      },
      // {
      //   test: /\.tsx?$/,
      //   exclude: /node_modules/,
      //   loader: 'ts-loader',
      // },
      // {
      //   test: /\.vue$/,
      //   loader: 'vue-loader',
      // },
      {
        test: /.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]_[hash:base64:5]',
                // 开发环境使用 '[path][name]__[local]'
                // 生产环境使用 '[hash:base64]'
              },
            },
          },
          'less-loader',
        ],
      },
      {
        test: /.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]_[hash:base64:5]',
                // 开发环境使用 '[path][name]__[local]'
                // 生产环境使用 '[hash:base64]'
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // 请确保引入这个插件！
    new VeauryVuePlugin({
      babelLoader: {
        // Set all vue files and js files in the 'toVue' directory to support vue type jsx
        include(filename) {
          // ignore node_modules
          if (filename.match(/[/\\]node_modules[\\/$]+/)) return
          // pass all vue file
          if (filename.match(/\.(vue|vue\.js)$/i)) {
            return filename
          }
          if (filename.match(/[/\\]toVue[\\/$]+/)) return filename
        },
        // exclude() {}
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'types',
        },
        // { from: 'other', to: 'public' },
      ],
    }),
    // new VueLoaderPlugin(),
  ],
}
