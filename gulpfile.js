const logger = require('winston');
const dotenvFlow = require('dotenv-flow');
const dotenvExpand = require('dotenv-expand');
fs = require('fs');
path = require('path');

const CONFIG_TEXT = 'window._env_ = ';
const CONFIG_FILE_NAME = 'env-config.js';

function buildConfiguration(cb) {
  const initialConfig = dotenvFlow.config({
    silent: true
  });
  dotenvExpand(initialConfig);

  const env = process.env;

  let configuration = {};
  const nodeEnv = env.NODE_ENV ? env.NODE_ENV : 'development';

  logger.info(`Building for : '${nodeEnv}'`);

  Object.keys(env).forEach(function (key) {
    if (key.startsWith('REACT_APP')) {
      configuration[key] = env[key];
      logger.info(`${key}: ${env[key]}`);
    }
  });

  configuration['REACT_APP_GRAPHQL_ENDPOINT'] = configuration['REACT_APP_GRAPHQL_ENDPOINT'] || '/graphql';

  const envBasePath = path.join(__dirname, '.env.deployment', '.env.base');
  let envBase = fs.createWriteStream(envBasePath, { flags: 'w' });

  Object.keys(configuration).forEach(k => {
    envBase.write(`${k}=${configuration[k]}\n`);
  });
  envBase.end();
  logger.info(`Write in: ${envBasePath}`);

  const envConfigPath = path.join(__dirname, '/public', CONFIG_FILE_NAME);
  fs.writeFile(envConfigPath, `${CONFIG_TEXT}${JSON.stringify(configuration, null, 2)}`, () => {
    logger.info(`Write in: ${envConfigPath}`);
    cb();
  });
}

exports.buildConfiguration = buildConfiguration;
exports.default = buildConfiguration;
