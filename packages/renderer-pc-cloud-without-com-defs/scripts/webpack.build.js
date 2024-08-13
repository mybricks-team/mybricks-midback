const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

const outputType = process.env.OUTPUT_TYPE

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    library: {
      name: 'rendererPcCloud',
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
      antd: 'antd',
      '@ant-design/icons': '@ant-design/icons',
      '@ant-design/icons-svg': '@ant-design/icons-svg'
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
  plugins: [],
}
