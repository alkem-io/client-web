import fs from 'fs';
import path from 'path';
import { version } from './package';

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

