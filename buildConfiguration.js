import dotenvFlow from 'dotenv-flow';
import { expand as dotenvExpand } from 'dotenv-expand';
import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const CONFIG_TEXT = 'window._env_ = ';
const CONFIG_FILE_NAME = 'env-config.js';

export function generateRobotsTxt(allowIndexing) {
  if (allowIndexing) {
    return [
      '# Alkemio - robots.txt',
      '',
      '# Global rules (all well-behaved crawlers)',
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /identity',
      'Disallow: /restricted',
      'Disallow: /profile',
      'Disallow: /api/',
      'Disallow: /graphql',
      'Disallow: /env-config.js',
      'Disallow: /meta.json',
      'Disallow: /assets/',
      'Crawl-delay: 1',
      '',
      '# AI / LLM scrapers - block by default',
      'User-agent: GPTBot',
      'Disallow: /',
      '',
      'User-agent: ChatGPT-User',
      'Disallow: /',
      '',
      'User-agent: Google-Extended',
      'Disallow: /',
      '',
      'User-agent: CCBot',
      'Disallow: /',
      '',
      'User-agent: anthropic-ai',
      'Disallow: /',
      '',
      'User-agent: ClaudeBot',
      'Disallow: /',
      '',
      'User-agent: Bytespider',
      'Disallow: /',
      '',
      'User-agent: PerplexityBot',
      'Disallow: /',
      '',
      'User-agent: Amazonbot',
      'Disallow: /',
      '',
      'User-agent: FacebookBot',
      'Disallow: /',
      '',
      'User-agent: Omgilibot',
      'Disallow: /',
      '',
      'User-agent: Diffbot',
      'Disallow: /',
      '',
      'User-agent: cohere-ai',
      'Disallow: /',
      '',
      '# Aggressive / poorly-behaved scrapers',
      'User-agent: AhrefsBot',
      'Disallow: /',
      '',
      'User-agent: SemrushBot',
      'Disallow: /',
      '',
      'User-agent: MJ12bot',
      'Disallow: /',
      '',
      'User-agent: DotBot',
      'Disallow: /',
      '',
      'User-agent: BLEXBot',
      'Disallow: /',
      '',
      '# Sitemap (uncomment when a sitemap is available)',
      '# Sitemap: https://app.alkem.io/sitemap.xml',
      '',
    ].join('\n');
  }
  return [
    '# Non-production environment - block all crawlers',
    'User-agent: *',
    'Disallow: /',
    '',
  ].join('\n');
}

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

  const robotsTxtPath = path.join(__dirname, '/public', 'robots.txt');
  await writeFile(robotsTxtPath, generateRobotsTxt(true));
  console.info(`Write in: ${robotsTxtPath}`);
}
const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  await buildConfiguration();
}