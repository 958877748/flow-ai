const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/script.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    compress: true,
    port: 9000,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new Dotenv()
  ]
};