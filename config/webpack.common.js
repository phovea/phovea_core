const path = require('path');
// const {entries} = require('./../.yo-rc.json')['generator-phovea'];
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  entry: {
    'main': path.join(__dirname, './../index.js')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          plugins: ["@babel/plugin-proposal-class-properties"]
        }
      },
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
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: {
          plugins: ["@babel/plugin-proposal-class-properties"]
        }
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './index.html'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
  ],
};

module.exports = config;
