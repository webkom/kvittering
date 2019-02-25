const path = require('path');

module.exports = [
  {
    test: /\.jsx?$/,
    include: path.resolve(__dirname, 'kvittering'),
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      plugins: ['react-hot-loader/babel']
    }
  },
  {
    test: /\.(woff|woff2)$/,
    exclude: path.resolve(__dirname, 'node_modules'),
    use: [
      {
        loader: 'url-loader',
        options: { prefix: 'font', limit: 5000 }
      }
    ]
  },
  {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    exclude: path.resolve(__dirname, 'node_modules'),
    use: [
      {
        loader: 'url-loader',
        options: {
          prefix: 'font',
          limit: 10000,
          mimetype: 'application/octet-stream'
        }
      }
    ]
  },
  {
    test: /\.(css)$/,
    exclude: path.resolve(__dirname, 'styles/base'),
    use: [
      {
        loader: 'style-loader'
      },
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          camelCase: 'dashes',
          importLoaders: 1,
          modules: true,
          localIdentName: '[name]__[local]___[hash:base64:5]'
        }
      }
    ]
  }
];
