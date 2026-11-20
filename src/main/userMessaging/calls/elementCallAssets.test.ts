import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ELEMENT_CALL_BASE, ELEMENT_CALL_LICENSE_PAGE } from './widgetUrl';

const repoRoot = process.cwd();
const packageDir = path.join(repoRoot, 'node_modules/@element-hq/element-call-embedded');
const installedVersion: string = JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8')).version;

type CopyTarget = { src: string; dest: string };

// The license the installed build declares: every SPDX header in its sources.
const declaredLicenses = (): string[] => {
  const found = new Set<string>();
  const distDir = path.join(packageDir, 'dist');
  for (const file of readdirSync(distDir, { recursive: true, encoding: 'utf8' })) {
    const fullPath = path.join(distDir, file);
    if (!existsSync(fullPath) || !/\.(js|map)$/.test(file)) continue;
    for (const match of readFileSync(fullPath, 'utf8').matchAll(
      /SPDX-License-Identifier: ([A-Za-z0-9.+\- ]+?)(?:\\n|\n|\*|")/g
    )) {
      found.add(match[1].trim());
    }
  }
  return [...found];
};

const loadCopyTargets = async (): Promise<CopyTarget[]> => {
  const modulePath = path.join(repoRoot, 'vite.element-call.mjs');
  const module = await import(/* @vite-ignore */ modulePath);
  return module.elementCallCopyTargets;
};

describe('call UI static files', () => {
  it('states the installed Element Call version, the license its sources declare and its corresponding source', () => {
    const page = readFileSync(path.join(repoRoot, '.build/element-call/SOURCE.html'), 'utf8');
    const licenses = declaredLicenses();
    expect(licenses).toHaveLength(1);
    expect(page).toContain(`<code id="license-expression">${licenses[0]}</code>`);
    expect(page).toContain(`<span id="component">Element Call ${installedVersion}</span>`);
    expect(page).toContain(`href="https://github.com/element-hq/element-call/tree/v${installedVersion}"`);
    for (const licenseText of ['LICENSE-AGPL-3.0', 'LICENSE-COMMERCIAL']) {
      expect(page).toContain(`href="${licenseText}"`);
    }
  });

  it('copies the call UI, its configuration, its license texts and its license page to /element-call/', async () => {
    const targets = await loadCopyTargets();
    expect(targets.every(target => `/${target.dest}/` === ELEMENT_CALL_BASE)).toBe(true);
    expect(targets.map(target => path.basename(target.src))).toContain(path.basename(ELEMENT_CALL_LICENSE_PAGE));
    expect(targets.map(target => target.src)).toEqual(
      expect.arrayContaining([
        'node_modules/@element-hq/element-call-embedded/dist/**/*',
        'node_modules/@element-hq/element-call-embedded/LICENSE-AGPL-3.0',
        'node_modules/@element-hq/element-call-embedded/LICENSE-COMMERCIAL',
        '.build/element-call/config.json',
        '.build/element-call/SOURCE.html',
      ])
    );
    for (const file of ['dist/index.html', 'LICENSE-AGPL-3.0', 'LICENSE-COMMERCIAL']) {
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
