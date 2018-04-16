/* eslint-env node */

const webpack = require('webpack');
const path = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

// Webpack prefers absolute paths, so generate the reference point for all
// paths to follow.
const rootDir = path.resolve(__dirname, '..');

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [
      ['es2015', { options: { modules: true } }],
    ],
    plugins: [

      // Some browser does not support Object.assign
      rootDir + '/node_modules/babel-plugin-transform-object-assign/lib/index.js',

      // Rest spread (i.e. the ... operator)
      rootDir + '/node_modules/babel-plugin-transform-object-rest-spread/lib/index.js',

      // Class properties (including fat arrow functions)
      rootDir + '/node_modules/babel-plugin-transform-class-properties/lib/index.js',
    ],
    cacheDirectory: rootDir + '.cache/babel-cache/',
  },
};

// The directories containing code we want to process (ie babel, uglify, tsc).
const codeIncludes = [
  /src\/(?:[^/]*(?:\/|$))*$/,
];

// Set up common build config.
var config = {

  // Since we are not debugging on browser we should use production mode
  mode: 'production',

  resolve: {

    symlinks: false,

    extensions: ['.js'],

    modules: [ path.join(rootDir, 'src') ],

  },

  plugins: [

    // Show progress in an appealing way.
    new webpack.ProgressPlugin(),

    // Enforce case sensitive paths to make sure we're not running into any
    // weird cache issues
    new CaseSensitivePathsPlugin(),

  ],

  module: {
    rules: [

      // Handle JS files.
      {
        test: /\.js$/,
        include: codeIncludes,
        use: [
          babelLoader,
        ],
      },
    ],
  },

  entry: {
    'app': './src/index.js',
  },

  output: {
    filename: '[name].js',
    path: path.join(rootDir, 'dist'),
  },

};

module.exports = config;