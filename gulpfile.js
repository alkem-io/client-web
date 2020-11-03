require('dotenv').config();
fs = require('fs');

const CONFIG_TEXT = `window._env_ = `;
const CONFIG_FILE_NAME = 'env-config.js';
const defaultTaks = cb => {
  const env = process.env;
  let configuration = {};

  Object.keys(env).forEach(function (key) {
    if (key.startsWith('REACT_APP')) configuration[key] = env[key];
  });

  configuration['REACT_APP_GRAPHQL_ENDPOINT'] =
    configuration['REACT_APP_GRAPHQL_ENDPOINT'] ||
    (env.NODE_ENV === 'production' ? '/graphql' : 'http://localhost:4000/graphql');

  fs.writeFile(`./public/${CONFIG_FILE_NAME}`, `${CONFIG_TEXT}${JSON.stringify(configuration, null, 2)}`, cb);
};

exports.default = defaultTaks;
