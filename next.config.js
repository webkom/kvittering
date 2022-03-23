const path = require('path');
const withPlugins = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');

module.exports = {
  env: {
    API_URL: process.env.API_URL,
  },
  webpack(config, options) {
    config.resolve.alias['components'] = path.join(
      __dirname,
      'webapp/components'
    );
    config.resolve.alias['utils'] = path.join(__dirname, 'webapp/utils');
    return config;
  },
};

module.exports = withPlugins([[optimizedImages, {}]]);
