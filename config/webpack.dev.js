const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');
const pkg = require('./../package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const config = {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: path.join(__dirname, './../build'),
    filename: '[name].js',
    publicPath: '/',
    library: 'phovea_core',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.(scss)$/,
        use: [
          'style-loader', 'css-loader', 'sass-loader'
        ]
      }
    ]
  },
  devServer: {
    port: 1234,
    index: 'index.html',
    contentBase: path.join(__dirname, './../build/'),
    proxy: {
      '/api/*': {
        target: 'http://localhost:9000',
        secure: false,
        ws: true
      },
      '/login': {
        target: 'http://localhost:9000',
        secure: false
      },
      '/logout': {
        target: 'http://localhost:9000',
        secure: false
      },
      '/loggedinas': {
        target: 'http://localhost:9000',
        secure: false
      },
      watchOptions: {
        aggregateTimeout: 500,
        ignored: /node_modules/
      }
    },
    watchOptions: {
      aggregateTimeout: 500,
      ignored: /node_modules/
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['phovea_core'],
      title: 'Hello Development Chunk',
      inject: true,
      meta: {
        description: 'dev description'
      }
    })
  ]
};

module.exports = merge(common, config);
