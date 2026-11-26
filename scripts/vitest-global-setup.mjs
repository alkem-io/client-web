import { readFileSync } from 'node:fs';

export default function setup() {
  const { volta } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const pinnedMajor = volta.node.split('.')[0];
  const runningMajor = process.versions.node.split('.')[0];

  if (runningMajor !== pinnedMajor) {
    throw new Error(
      `Vitest requires Node.js major ${pinnedMajor} (package.json volta.node=${volta.node}), ` +
        `but is running ${process.version} (${process.execPath}). ` +
        `Run tests with: volta run --node ${volta.node} -- pnpm exec vitest run`
    );
  }
}
