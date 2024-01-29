const path = require('path');

module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
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
