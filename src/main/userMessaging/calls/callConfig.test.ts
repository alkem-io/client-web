import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ env: {} as { VITE_APP_LIVEKIT_SERVICE_URL?: string } }));

vi.mock('@/main/env', () => ({ env: harness.env }));

import { getCallConfig, isCallsConfigured } from './callConfig';

describe('callConfig', () => {
  beforeEach(() => {
    delete harness.env.VITE_APP_LIVEKIT_SERVICE_URL;
  });

  it('is off when the key is not set', () => {
    expect(getCallConfig()).toEqual({ livekitServiceUrl: '' });
    expect(isCallsConfigured()).toBe(false);
  });

  it('is off when the key holds only whitespace', () => {
    harness.env.VITE_APP_LIVEKIT_SERVICE_URL = '   ';
    expect(getCallConfig().livekitServiceUrl).toBe('');
    expect(isCallsConfigured()).toBe(false);
  });

  it('is on with the trimmed URL when the key is set', () => {
    harness.env.VITE_APP_LIVEKIT_SERVICE_URL = ' https://matrix.example.org/livekit/jwt \n';
    expect(getCallConfig().livekitServiceUrl).toBe('https://matrix.example.org/livekit/jwt');
    expect(isCallsConfigured()).toBe(true);
  });
});
