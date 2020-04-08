const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const common = require('./webpack.common');
const pkg = require('./../package.json');


const libName = pkg.name;
const libDesc = pkg.description;

const config = {
  mode: 'production',
  // see https://webpack.js.org/configuration/devtool/#devtool
  devtool: 'source-map',
  output: {
    // filename: '[name].min.js',
    filename: '[name].js',
    chunkFilename: '[chunkhash].js',
    path: path.resolve(__dirname, './../bundles'),
    pathinfo: false,
    publicPath: '',
    library: libName,
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
            parallel: true,
            sourceMap: true
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
        path.join(process.cwd(), './../bundles/**/*')
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      // which bundles should be included; vendors includes common libraries
      chunks: ['main', 'vendors~main'],
      title: libName,
      inject: true,
      meta: {
        description: libDesc
      }
    })
  ]
};

module.exports = merge(common, config);
