const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ManifestPlugin = require('webpack-manifest-plugin');

const config = {
  entry: {
    'phovea_core': path.join(__dirname, './../index.js')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts)x?$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ],
        // include: path.resolve('src'),
        exclude: /node_modules/
      },
      { test: /\.(xml)$/, use: 'xml-loader' },
      { test: /\.(png|jpg)$/, loader: 'file-loader' },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader',
        options: {
          limit: 10000, // inline <= 10kb
          mimetype: 'application/font-woff'
        }
      },
      {
        test: /\.svg(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader',
        options: {
          limit: 10000, // inline <= 10kb
          mimetype: 'image/svg+xml'
        }
      },
      { test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' }
    ],
  },
  plugins: [
    // minification and extraction of css files is not required in development
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        '**/*',
        path.join(process.cwd(), './../build/**/*')
      ]
    }),
    new HtmlWebpackPlugin({
      title: 'Setting up webpack 4',
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true
      },
    }),
    new BundleAnalyzerPlugin({
      // set to 'server' to start analyzer during build
      analyzerMode: 'disabled',
      generateStatsFile: true,
      statsOptions: { source: false }
    }),
    new ManifestPlugin()
  ],
};

module.exports = config;
