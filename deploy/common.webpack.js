var path = require('path');
var ExtractPlugin = require('extract-text-webpack-plugin');

module.exports = {
  debug: false,
  devtool: false,

  resolve: {
    root: path.resolve('.'),
  },

  module: {
    preLoaders: [

      {
        test: /\.js$/,
        loader: 'eslint',
        include: path.resolve('./src/Marketplace/UIBundle/Resources/private/00-Scripts'),
      },

    ], // End preLoaders

    loaders: [

      {
        test: /\.js$/,
        loader: 'babel',
        include: path.resolve('./src/Marketplace/UIBundle/Resources/private/00-Scripts'),
      },
      {
        test: /\.scss$/,
        loader: ExtractPlugin.extract(
          'style-loader',
          [
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ]
        ),
        include: path.resolve('./src/Marketplace/UIBundle/Resources/private'),
      },
      {
        test: /\.(woff|eot|ttf)$/,
        loader: 'url',
        query: {
          limit: 1,
          path: '',
          name: '[name].[ext]',
        },
        include: path.resolve('./src/Marketplace/UIBundle/Resources/private'),
      },
      {
        test: /\.(png|gif|jpe?g|svg)$/i,
        loader: 'url',
        query: {
          limit: 10000,
          path: '',
          name: '[name].[ext]',
        },
        include: path.resolve('./src/Marketplace/UIBundle/Resources/private'),
      },

    ], // End loaders
  },
};
