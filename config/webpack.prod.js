const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');
const common = require('./webpack.common');

const config = {
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'js/main.[contentHash].js',
    publicPath: './',
  },
  plugins: [new CleanWebpackPlugin()],
};

module.exports = merge(common, config);
