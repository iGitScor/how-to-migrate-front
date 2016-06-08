/** Package dependencies */
var path = require('path');
var webpack = require('webpack');
var CleanPlugin = require('clean-webpack-plugin');
var ExtractPlugin = require('extract-text-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');
var S3Plugin = require('webpack-s3-plugin');
var lost = require('lost');
var autoprefixer = require('autoprefixer');
var yamlLoader = require('yamljs');

/** Common Webpack configuration **/
var common = require('./common.webpack.js');

/** Environment variable */
var environment = 'prod';
var environmentPath = environment + '/';
var siteConfiguration = yamlLoader.load('app/config/parameters.yml');
var s3Path = [
  siteConfiguration.parameters.assets_base_uri,
  'asset',
  '/',
].join('');
var s3Options = {
  accessKeyId: siteConfiguration.parameters.amazon_key,
  secretAccessKey: siteConfiguration.parameters.amazon_secret_key,
  region: siteConfiguration.parameters.amazon_region,
};

// Default plugins
common.plugins = [
  new ExtractPlugin(
    'style.min.css'
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

  // This plugin looks for similar chunks and files
  // and merges them for better caching by the user
  new webpack.optimize.DedupePlugin(),

  // This plugins optimizes chunks and modules by
  // how much they are used in your app
  new webpack.optimize.OccurenceOrderPlugin(),

  // This plugin prevents Webpack from creating chunks
  // that would be too small to be worth loading separately
  new webpack.optimize.MinChunkSizePlugin({
    minChunkSize: 51200, // ~50kb
  }),

  // This plugin minifies all the Javascript code of the final bundle
  new webpack.optimize.UglifyJsPlugin({
    mangle: true,
    compress: {
      warnings: false, // Suppress uglification warnings
    },
  }),

  // This plugins defines various variables that we can set to false
  // in production to avoid code related to them from being compiled
  // in our final bundle
  new webpack.DefinePlugin({
    __SERVER__: false,
    __DEVELOPMENT__: false,
    __DEVTOOLS__: false,
    'process.env': {
      BABEL_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }),

  function extractMediaQuery() {
    this.plugin('done', function done() {
      var extractor = require('media-query-extractor');

      extractor(path.resolve('./web/assets/prod/style.min.css'), './web/assets/prod/output.css', [
        '(min-width:48em)|./web/assets/prod/tablet.css',
      ]);

      var compress = new CompressionPlugin(
        {
          asset: '[path]',
          algorithm: 'gzip',
          test: /\.js$|\.css$/,
        }
      );
    });
  },

  // new CompressionPlugin(
  //   {
  //     asset: '[path]',
  //     algorithm: 'gzip',
  //     test: /\.js$|\.css$/,
  //   }
  // ),

  // new S3Plugin({
  //   // Only upload css and js
  //   include: /.*\.(css|js)/,
  //
  //   // s3Options are required
  //   s3Options: s3Options,
  //   s3UploadOptions: {
  //     Bucket: siteConfiguration.parameters.amazon_bucket,
  //     CacheControl: 'max-age=315360000, no-transform, public',
  //     ContentEncoding: 'gzip',
  //   },
  // }),

  // new S3Plugin({
  //   // Only upload font
  //   include: /.*\.(eot|svg|ttf|woff)/,
  //
  //   s3Options: s3Options,
  //   s3UploadOptions: {
  //     Bucket: siteConfiguration.parameters.amazon_bucket,
  //   },
  // }),
];

// Main file load configuration
common.entry = {
  application: [
    './src/[BundlePath]/Resources/private/00-Scripts/',
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
  publicPath: s3Path,
};

// Post css configuration
common.postcss = function postcss() {
  var postcssPlugins = [];

  postcssPlugins.push(lost);
  postcssPlugins.push(autoprefixer);

  return postcssPlugins;
};

module.exports = common;
