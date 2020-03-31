const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');
const pkg = require('./../package.json');


let libName = /phovea_.*/.test(pkg.name) ? ['phovea', pkg.name.slice(7)] : pkg.name;

const config = {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: path.join(__dirname, './../build'),
    filename: '[name].[contenthash:8].js',
    publicPath: '/',
    library: libName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devServer: {
    port: 1234,
    index: 'index.html',
    contentBase: path.join(__dirname, './../build/')
  }
};

module.exports = merge(common, config);
