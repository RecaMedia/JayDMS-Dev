const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: '../project/jdms/admin/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: {
    'js/admin.js': './jsx/admin.jsx',
    'css/admin.css': './sass/admin.scss'
  },
  output: {
    path: path.resolve('dist'),
    filename: '../project/jdms/admin/assets/[name]'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      }, {
        test: /\.(sass|scss|svg|png|jpe?g)$/i,
        use: [
          "style-loader",
          {
            loader: "resolve-url-loader", //resolve-url-loader needs to come *BEFORE* sass-loader
            options: {
              root: path.resolve('../project/jdms/admin/assets/'),
              absolute: true,
              sourceMap: true
            }
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
              sassOptions: {
                outputStyle: 'compressed'
              }
            }
          }
        ]
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader"
      }, {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: "babel-loader"
      }
    ]
  },
  plugins: [HtmlWebpackPluginConfig],
}