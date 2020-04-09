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
    filename: '[name].min.js',
    // filename: '[name].js',
    chunkFilename: '[chunkhash].js',
    path: path.resolve(__dirname, './../bundles'),
    pathinfo: false,
    publicPath: '',
    library: libName,
    libraryTarget: 'umd',
    umdNamedDefine: false
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      automaticNameDelimiter: '~',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]((?!(phovea_.*|tdp_.*)).*)[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
        },
        phovea: {
          test: /[\\/]node_modules[\\/]((phovea_.*).*)[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `phovea.${packageName.replace('@', '')}`;
          },
        },
        tdp: {
          test: /[\\/]node_modules[\\/]((tdp_.*).*)[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `tdp.${packageName.replace('@', '')}`;
          },
        },
      },
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
