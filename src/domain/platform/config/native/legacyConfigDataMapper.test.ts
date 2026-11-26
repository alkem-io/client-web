import { describe, expect, it } from 'vitest';
import { toLegacyConfiguration } from './legacyConfigDataMapper';

const input = {
  languages: ['en', 'nl'],
  defaultLanguage: 'nl',
  features: { chat: true, assistant: false, malformed: 'true' },
  links: [
    { key: 'domain', url: 'http://localhost:18081' },
    { key: 'support', url: 'https://support.example' },
  ],
  iframeAllowlist: ['https://office.example'],
  geo: null,
};

describe('legacy config props from declared native data', () => {
  it('preserves the native origin port without constructing a second protocol prefix', () => {
    const result = toLegacyConfiguration(input);
    expect(result.locations.domain).toBe('localhost:18081');
    expect(result.locations.support).toBe('https://support.example');
    expect(result.language).toEqual({ eligible: ['en', 'nl'], default: 'nl' });
    expect(result.featureFlags).toEqual([
      { name: 'chat', enabled: true },
      { name: 'assistant', enabled: false },
    ]);
  });

  it('omits absent optional links and auth-provider fields instead of fabricating values', () => {
    const result = toLegacyConfiguration(input);
    expect(result.locations).not.toHaveProperty('blog');
    expect(result.locations).not.toHaveProperty('landing');
    expect(result).not.toHaveProperty('authentication');
    expect(result).not.toHaveProperty('sentry');
    expect(result).not.toHaveProperty('apm');
    expect(result).not.toHaveProperty('geo');
  });

  it('keeps supplied optional links and maps environment from telemetry, never a URL link', () => {
    const result = toLegacyConfiguration({
      ...input,
      links: [...input.links, { key: 'innovationLibrary', url: 'https://library.example' }],
      telemetry: {
        environment: 'acceptance',
        sentry: { enabled: false, submitPII: false, endpoint: null },
        apm: { rumEnabled: false, endpoint: null },
      },
    });
    expect(result.locations.innovationLibrary).toBe('https://library.example');
    expect(result.locations.environment).toBe('acceptance');
    expect(result.sentry).toEqual({ enabled: false, submitPII: false });
    expect(result.apm).toEqual({ rumEnabled: false });
  });

  it('refuses an absent or malformed required origin without guessing from window.location', () => {
    expect(() => toLegacyConfiguration({ ...input, links: [] })).toThrow('config.links.domain');
    expect(() =>
      toLegacyConfiguration({ ...input, links: [{ key: 'domain', url: 'https://example.test/a-path' }] })
    ).toThrow('HTTP origin');
  });
});
