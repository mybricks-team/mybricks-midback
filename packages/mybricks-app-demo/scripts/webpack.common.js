const path = require('path')

// const ignoreWarningPlugin = require('./_ignoreWarningPlugin')

const WebpackBar = require('webpackbar')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const outputPath = path.resolve(__dirname, `../targets`)

module.exports = {
  mode: 'development',
  output: {
    path: outputPath,
    filename: './[name].js',
    libraryTarget: 'umd',
    library: '[name]',
  },
  resolve: {
    alias: {},
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  externals: [
    {
      react: {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react',
        root: 'React',
      },
      'react-dom': {
        commonjs: 'react-dom',
        commonjs2: 'react-dom',
        amd: 'react-dom',
        root: 'ReactDOM',
      },
      antd: {
        commonjs: 'antd',
        commonjs2: 'antd',
        amd: 'antd',
        root: 'antd',
      },
      '@ant-design/icons': 'icons',
      '@mybricks/editors-pc-common': 'pcEditors',
    },
  ],
  devtool: 'cheap-source-map', //devtool: 'cheap-source-map',
  devServer: {
    static: {
      directory: outputPath,
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.use((req, res, next) => {
        if (req.url === '/build.html') {
          res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        }
        next();
      });
      return middlewares;
    },
    port: 8000,
    host: '0.0.0.0',
    // compress: true,
    // hot: true,
    client: {
      logging: 'warn',
      // overlay: true,
      // progress: true,
    },
    // open:true,
    proxy: [
      {
        context: ['/api/'],
        target: 'https://my.mybricks.world',
        // target: 'http://localhost:9001',
        secure: false,
        changeOrigin: true,
      },
      {
        context: ['/paas/api/'],
        target: 'https://my.mybricks.world',
        // target: 'http://localhost:9001',
        secure: false,
        changeOrigin: true,
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              silent: true,
              transpileOnly: true,
              compilerOptions: {
                module: 'es6',
                target: 'es6',
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        // exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /^[^\.]+\.less$/i,
        use: [
          {
            loader: 'style-loader',
            options: { injectType: 'singletonStyleTag' },
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]-[hash:5]',
              },
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.(xml|txt|html|cjs|theme)$/i,
        use: [{ loader: 'raw-loader' }],
      },
    ],
  },
  optimization: {
    concatenateModules: false, //name_name
  },
  plugins: [
    new WebpackBar(),
    // new ignoreWarningPlugin(),   // All warnings will be ignored
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    // }),
  ],
}
