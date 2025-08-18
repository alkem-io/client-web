import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { version } from './package.json';

// no __dirname in ESM, so we need to use fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a public/meta.json file with the current package version.
 */
export function generateMetaJson() {
  const outDir = path.resolve(__dirname, 'public');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.resolve(outDir, 'meta.json'),
    JSON.stringify({ version }, null, 2)
  );
}
