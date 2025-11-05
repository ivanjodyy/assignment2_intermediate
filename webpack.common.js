const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: { app: path.resolve(__dirname, 'src/scripts/index.js') },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    clean: true,
  },
  module: {
    rules: [
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
      { test: /\.js$/i, exclude: /node_modules/, use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } } },
      { test: /\.(png|jpg|jpeg|gif|svg)$/i, type: 'asset/resource', generator: { filename: 'images/[name][ext]' } },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
      inject: 'body',
      scriptLoading: 'defer',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/public',
          to: '.',
          globOptions: {
            // ⬇️ JANGAN salin file HTML apa pun dari public
            ignore: ['**/*.html'],
          },
        },
        { from: 'src/sw.js', to: 'sw.js' },
      ],
    }),
  ],
};
