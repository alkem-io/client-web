import { describe, expect, it } from 'vitest';
import { buildDevContentSecurityPolicy } from './devPolicy';

const DIRECTIVES = [
  'default-src',
  'base-uri',
  'object-src',
  'frame-ancestors',
  'form-action',
  'script-src',
  'style-src',
  'font-src',
  'img-src',
  'media-src',
  'connect-src',
  'frame-src',
  'worker-src',
  'manifest-src',
];

describe('buildDevContentSecurityPolicy', () => {
  const policy = buildDevContentSecurityPolicy({
    appOrigin: 'http://localhost:3000',
    matrixUrl: 'http://localhost:8008',
    identityOrigin: 'http://localhost:3000',
  });
  const directive = (name: string) => policy.split('; ').filter(d => d.startsWith(`${name} `));

  it('lists every directive of the deployed policy exactly once', () => {
    for (const name of DIRECTIVES) expect(directive(name), name).toHaveLength(1);
  });

  it('keeps script-src strict', () => {
    expect(directive('script-src')[0]).not.toContain("'unsafe-inline'");
    expect(directive('script-src')[0]).not.toContain("'unsafe-eval'");
  });

  it('admits the local homeserver, websocket origin and https frames', () => {
    expect(directive('connect-src')[0]).toContain('http://localhost:8008');
    expect(directive('connect-src')[0]).toContain('ws://localhost:3000');
    expect(directive('frame-src')[0]).toContain('https:');
  });

  it('admits data: fetches for whiteboard images', () => {
    expect(directive('connect-src')[0]).toContain('data:');
  });

  it('admits the social-login provider redirects', () => {
    expect(directive('form-action')[0]).toContain('https://www.linkedin.com');
    expect(directive('form-action')[0]).toContain('https://login.microsoftonline.com');
  });
});
