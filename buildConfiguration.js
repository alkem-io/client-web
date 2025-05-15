import dotenvFlow from 'dotenv-flow';
import { expand as dotenvExpand } from 'dotenv-expand';
import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const CONFIG_TEXT = 'window._env_ = ';
const CONFIG_FILE_NAME = 'env-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildConfiguration() {
  const initialConfig = dotenvFlow.config({
    silent: true,
  });
  dotenvExpand(initialConfig);

  const env = process.env;

  const configuration = {};
  const nodeEnv = env.MODE ? env.MODE : 'development';

  console.info(`Building for : '${nodeEnv}'`);

  Object.keys(env).forEach(function (key) {
    if (key.startsWith('VITE_APP')) {
      configuration[key] = env[key];
      console.info(`${key}: ${env[key]}`);
    }
  });

  configuration['VITE_APP_GRAPHQL_ENDPOINT'] = configuration['VITE_APP_GRAPHQL_ENDPOINT'] || '/graphql';

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
