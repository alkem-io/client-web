import { describe, expect, it } from 'vitest';
import { isLocalDevServer, orLocalDevDefault } from './localDevServer';

describe('localDevServer', () => {
  it('keeps a configured value, on the dev server too', () => {
    expect(orLocalDevDefault('https://matrix.example.org', 'http://localhost:8008', true)).toBe(
      'https://matrix.example.org'
    );
  });

  it('falls back to the local stack address for an empty value on the dev server', () => {
    expect(orLocalDevDefault('', 'http://localhost:8008', true)).toBe('http://localhost:8008');
  });

  it('leaves an empty value empty outside the dev server, as in every built image', () => {
    expect(orLocalDevDefault('', 'http://localhost:8008', false)).toBe('');
  });

  it('is not the dev server under the test runner', () => {
    expect(isLocalDevServer()).toBe(false);
  });
});
