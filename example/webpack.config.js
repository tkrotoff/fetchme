// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  entry: './index.ts',

  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },

  // See https://github.com/facebook/create-react-app/blob/v2.1.0/packages/react-scripts/config/webpack.config.dev.js#L93
  // See https://reactjs.org/docs/cross-origin-errors.html#source-maps
  devtool: 'cheap-module-source-map',

  resolve: {
    extensions: ['.js', '.ts']
  },

  module: {
    rules: [
      {
        test: /\.(js|ts)$/,

        // See [Babel should not transpile core-js](https://github.com/zloirock/core-js/issues/514#issuecomment-476533317)
        exclude: /\/core-js/,

        loader: 'babel-loader'
      },
      { test: /\.html$/, loader: 'file-loader', options: { name: '[path][name].[ext]' } }
    ]
  }
};