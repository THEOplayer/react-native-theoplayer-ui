/* eslint-disable @typescript-eslint/no-var-requires,no-undef */
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const projectDirectory = path.resolve(__dirname, '..');

// A folder for any stub components we need in case there is no counterpart for it on react-native-web.
const stubDirectory = path.resolve(projectDirectory, './web/stub/');

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: path.resolve(projectDirectory, './web/public/index.html'),
  filename: 'index.html',
  inject: 'body',
});

// THEOplayer's libraryLocation.
const libraryLocation = 'theoplayer';

// Webpack's output location
const outputLocation = 'dist';

const CopyWebpackPluginConfig = new CopyWebpackPlugin({
  patterns: [
    {
      // Copy transmuxer worker files.
      // THEOplayer will find them by setting `libraryLocation` in the playerConfiguration.
      from: path.resolve(projectDirectory, './node_modules/theoplayer/THEOplayer.transmux.*').replace(/\\/g, '/'),
      to: `${libraryLocation}/[name][ext]`,
    },
    {
      // Copy CSS files
      from: path.resolve(projectDirectory, './web/public/*.css').replace(/\\/g, '/'),
      to: `[name][ext]`,
    },
  ],
});

// This is needed for webpack to compile JavaScript.
// Many OSS React Native packages are not compiled to ES5 before being
// published. If you depend on uncompiled packages they may cause webpack build
// errors. To fix this webpack can be configured to compile to the necessary
// `node_module`.
const babelLoaderConfiguration = {
  test: /\.tsx?$/,
  exclude: ['/**/*.d.ts', '/**/node_modules/'],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      // The 'metro-react-native-babel-preset' preset is recommended to match React Native's packager
      presets: ['module:metro-react-native-babel-preset'],
      // Re-write paths to import only the modules needed by the app
      plugins: ['react-native-web'],
    },
  },
};

// This is needed for webpack to import static images in JavaScript files.
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'react-native-web-image-loader',
  },
};

module.exports = {
  entry: [
    // load any web API polyfills
    // path.resolve(projectDirectory, 'polyfills-web.js'),
    // your web-specific entry file
    path.resolve(projectDirectory, 'index.web.tsx'),
  ],

  // configures where the build ends up
  output: {
    filename: 'bundle.web.js',
    path: path.resolve(projectDirectory, outputLocation),
  },

  module: {
    rules: [babelLoaderConfiguration, imageLoaderConfiguration],
  },
  resolve: {
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-url-polyfill': 'url-polyfill',
      'react-native-google-cast': path.resolve(stubDirectory, 'CastButtonStub'),
      'react-native-web': path.resolve(projectDirectory, 'node_modules/react-native-web'),
      'react-native-svg': path.resolve(projectDirectory, 'node_modules/react-native-svg-web'),

      // Avoid duplicate react env.
      react: path.resolve(projectDirectory, 'node_modules/react'),
      'react-dom': path.resolve(projectDirectory, 'node_modules/react-dom'),
    },
  },
  plugins: [HTMLWebpackPluginConfig, CopyWebpackPluginConfig, new NodePolyfillPlugin()],
  devServer: {
    // Tells dev-server to open the browser after server had been started.
    open: true,
    historyApiFallback: true,
    static: [
      {
        directory: path.join(projectDirectory, 'web/public'),
      },
    ],
    // Hot reload on source changes
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: false,
      },
    },
  },
};
