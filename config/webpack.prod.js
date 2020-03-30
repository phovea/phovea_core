const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const common = require('./webpack.common');
const pkg = require('./../package.json');


let libName = /phovea_.*/.test(pkg.name) ? ['phovea', pkg.name.slice(7)] : pkg.name;

const config = {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, './../dist'),
    publicPath: '',
    library: libName,
    libraryTarget: 'umd'
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      // otherwise react would be too small to be bundled separately
      minSize: 10000,
      automaticNameDelimiter: '_'
    }
  },
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: [
          MiniCssExtractPlugin.loader, 'css-loader'
        ]
      },
      {
        test: /\.(scss)$/,
        use: [
          MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    // TerserPlugin is added by default in production mode
    // extracts css in separate file
    new MiniCssExtractPlugin({
      filename: 'styles.[name].[contenthash].css'
    }),
    // cleans output.path folder (removes old files before new build)
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        '**/*',
        path.join(process.cwd(), 'dist/**/*')
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      // which bundles should be included; vendors includes common libraries
      chunks: ['index', 'vendors_index'],
      title: 'Hello World Chunk',
      meta: {
        description: 'chunk description'
      }
    })
  ]
};

module.exports = merge(common, config);
