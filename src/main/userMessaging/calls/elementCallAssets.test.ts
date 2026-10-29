import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const packageDir = path.join(repoRoot, 'node_modules/@element-hq/element-call-embedded');
const installedVersion: string = JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8')).version;

type CopyTarget = { src: string; dest: string };

const loadCopyTargets = async (): Promise<CopyTarget[]> => {
  const modulePath = path.join(repoRoot, 'vite.element-call.mjs');
  const module = await import(/* @vite-ignore */ modulePath);
  return module.elementCallCopyTargets;
};

describe('call UI static files', () => {
  it('states the installed Element Call version and its corresponding source', () => {
    const source = readFileSync(path.join(repoRoot, '.build/element-call/SOURCE.txt'), 'utf8');
    expect(source.trim()).toBe(
      `Element Call ${installedVersion}, unmodified, Copyright New Vector Ltd, licensed AGPL-3.0-or-later ` +
        '(also available under a commercial licence from Element). Corresponding source: ' +
        `https://github.com/element-hq/element-call/tree/v${installedVersion}`
    );
  });

  it('copies the call UI, its configuration, its licence and its source statement to /element-call/', async () => {
    const targets = await loadCopyTargets();
    expect(targets.every(target => target.dest === 'element-call')).toBe(true);
    expect(targets.map(target => target.src)).toEqual(
      expect.arrayContaining([
        'node_modules/@element-hq/element-call-embedded/dist/**/*',
        'node_modules/@element-hq/element-call-embedded/LICENSE-AGPL-3.0',
        '.build/element-call/config.json',
        '.build/element-call/SOURCE.txt',
      ])
    );
    for (const file of ['dist/index.html', 'LICENSE-AGPL-3.0']) {
      expect(existsSync(path.join(packageDir, file))).toBe(true);
    }
  });

  it('is part of both the development and the release Vite configuration', () => {
    for (const config of ['vite.config.mjs', 'vite.sentry.config.mjs']) {
      const text = readFileSync(path.join(repoRoot, config), 'utf8');
      expect(text).toMatch(/import \{ elementCallStaticCopy \} from '\.\/vite\.element-call\.mjs';/);
      expect(text).toMatch(/^\s+elementCallStaticCopy\(\),$/m);
    }
  });
});
