/** Package dependencies */
var path = require('path');
var webpack = require('webpack');
var CleanPlugin = require('clean-webpack-plugin');
var ExtractPlugin = require('extract-text-webpack-plugin');
var lost = require('lost');
var mdcss = require('mdcss');
var autoprefixer = require('autoprefixer');
var styleguide = require('mdcss-theme-github-iscor');

/** Common Webpack configuration **/
var common = require('./common.webpack.js');

/** Environment variable */
var environment = 'dev';
var environmentPath = environment + '/';
var mdPicturePath = 'https://avatars.githubusercontent.com/u/6058056';
var cssPath = 'bundle.css';

// Default plugins
common.plugins = [
  new ExtractPlugin(
    cssPath
  ),

  new webpack.optimize.AggressiveMergingPlugin({
    name: 'main.min', // Move dependencies to our main file
    children: true, // Look for common dependencies in all children,
    minChunks: 2, // How many times a dependency must come up before being extracted
  }),

  // Cleanup the build folder before
  // compiling our final assets
  new CleanPlugin(
    './web/assets/' + environmentPath,
    {
      root: path.resolve('.'),
    }
  ),
];

// Specific dev parameters for webpack interpretation
common.debug = true;
common.devtool = 'eval';

// Main file load configuration
common.entry = {
  application: [
    './src/Marketplace/UIBundle/Resources/private/00-Scripts/',
    environmentPath,
    'application.js',
  ].join(''),
};

// Output configuration
common.output = {
  path: [
    './web/assets/',
    environmentPath,
  ].join(''),
  filename: '[name].js',
  chunkFilename: '[name].js',
  publicPath: [
    '/assets/',
    environmentPath,
  ].join(''),
};

// Post css configuration
common.postcss = function postcss() {
  var postcssPlugins = [];

  postcssPlugins.push(
    mdcss({
      theme: styleguide,
      destination: 'resources/doc/styleguide',
      logo: mdPicturePath,
      examples: {
        css: [
          '../../../web/assets/dev/' + cssPath,
        ],
      },
    })
  );

  postcssPlugins.push(lost);
  postcssPlugins.push(autoprefixer);

  return postcssPlugins;
};

// Watch frequency
common.watchOptions = {
  poll: 500,
};

module.exports = common;
