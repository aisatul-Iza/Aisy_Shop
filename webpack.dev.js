const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './Script/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'docs'),
    publicPath: '/Aisy_Shop/',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'styles', to: 'Styles' },
        { from: 'app.webmanifest', to: 'app.webmanifest' },
        { from: 'icons', to: 'icons' },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'docs'),
    },
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
  },
};
