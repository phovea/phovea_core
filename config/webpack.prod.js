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
  // see https://webpack.js.org/configuration/devtool/#devtool
  // devtool: 'source-map',
  output: {
    // filename: '[name].min.js',
    filename: '[name].js',
    chunkFilename: '[chunkhash].js',
    path: path.resolve(__dirname, './../build'),
    publicPath: '',
    library: 'phovea_core',
    libraryTarget: 'umd',
    umdNamedDefine: false
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      // otherwise react would be too small to be bundled separately
      minSize: 10000,
      automaticNameDelimiter: '~'
    },
    minimizer: [
      (compiler) => {
        const TerserPlugin = require('terser-webpack-plugin');
        new TerserPlugin({
            cache: true,
            parallel: true
        }).apply(compiler);
      }
    ],
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
  // TerserPlugin is added by default in production mode
  plugins: [
    // extracts css in separate file
    new MiniCssExtractPlugin({
      filename: 'styles.[name].[contenthash].css'
    }),
    // cleans output.path folder (removes old files before new build)
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        '**/*',
        path.join(process.cwd(), './../build/**/*')
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      // which bundles should be included; vendors includes common libraries
      chunks: ['phovea_core', 'vendors~phovea_core'],
      title: 'phovea_core',
      inject: true,
      meta: {
        description: 'library description'
      }
    })
  ]
};

module.exports = merge(common, config);
