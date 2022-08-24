const dotenvFlow = require('dotenv-flow');
const dotenvExpand = require('dotenv-expand');
const { createWriteStream } = require('fs');
const { writeFile } = require('fs/promises');
const path = require('path');

const CONFIG_TEXT = 'window._env_ = ';
const CONFIG_FILE_NAME = 'env-config.js';

async function buildConfiguration() {
  const initialConfig = dotenvFlow.config({
    silent: true,
  });
  dotenvExpand(initialConfig);

  const env = process.env;

  const configuration = {};
  const nodeEnv = env.NODE_ENV ? env.NODE_ENV : 'development';

  console.info(`Building for : '${nodeEnv}'`);

  Object.keys(env).forEach(function (key) {
    if (key.startsWith('REACT_APP')) {
      configuration[key] = env[key];
      console.info(`${key}: ${env[key]}`);
    }
  });

  configuration['REACT_APP_GRAPHQL_ENDPOINT'] = configuration['REACT_APP_GRAPHQL_ENDPOINT'] || '/graphql';

  const envBasePath = path.join(__dirname, '.build', 'docker', '.env.base');
  const envBase = createWriteStream(envBasePath, { flags: 'w' });

  Object.keys(configuration).forEach(k => {
    envBase.write(`${k}=${configuration[k]}\n`);
  });
  envBase.end();
  console.info(`Write in: ${envBasePath}`);

  const envConfigPath = path.join(__dirname, '/public', CONFIG_FILE_NAME);
  await writeFile(envConfigPath, `${CONFIG_TEXT}${JSON.stringify(configuration, null, 2)}`);
  console.info(`Write in: ${envConfigPath}`);
}

(async () => {
  await buildConfiguration();
})();
