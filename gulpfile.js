const dotenvFlow = require('dotenv-flow');
const dotenvExpand = require('dotenv-expand');
fs = require('fs');
path = require('path');

const CONFIG_TEXT = `window._env_ = `;
const CONFIG_FILE_NAME = 'env-config.js';

function buildConfiguration (cb) {

  const initialConfig = dotenvFlow.config();
  dotenvExpand(initialConfig);

  const env = process.env;

  let configuration = {};
  const nodeEnv = env.NODE_ENV ? env.NODE_ENV : 'development';

  console.info(`Building for : '${nodeEnv}'`);

  Object.keys(env).forEach(function (key) {
    if (key.startsWith('REACT_APP')) {
      configuration[key] = env[key];
      console.info(`${key}: ${env[key]}`);
    }
  });

  configuration['REACT_APP_GRAPHQL_ENDPOINT'] =
    configuration['REACT_APP_GRAPHQL_ENDPOINT'] ||
    (nodeEnv === 'production' ? '/graphql' : 'http://localhost:4000/graphql');

  let envBase = fs.createWriteStream(path.join(__dirname, '.env.deployment', '.env.base'), { flags: 'w' });

  Object.keys(configuration).forEach(k => {
    envBase.write(`${k}=${configuration[k]}\n`);
  });
  envBase.end();

  fs.writeFile(`./public/${CONFIG_FILE_NAME}`, `${CONFIG_TEXT}${JSON.stringify(configuration, null, 2)}`, cb);
};

exports.buildConfiguration = buildConfiguration;
exports.default = buildConfiguration;
