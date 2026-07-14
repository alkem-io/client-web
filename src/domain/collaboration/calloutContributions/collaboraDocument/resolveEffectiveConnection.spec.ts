import { describe, expect, it } from 'vitest';
import { resolveEffectiveConnection } from './useCollaboraEditorConnection';

describe('resolveEffectiveConnection', () => {
  it('folds a confirmed save-path outage into a service disconnect when otherwise connected', () => {
    expect(resolveEffectiveConnection('connected', null, true)).toEqual({
      status: 'disconnected',
      cause: 'service',
      saveOutage: true,
    });
  });

  it('also overrides while still connecting', () => {
    expect(resolveEffectiveConnection('connecting', null, true)).toEqual({
      status: 'disconnected',
      cause: 'service',
      saveOutage: true,
    });
  });

  it('never overrides an existing hard drop — the real cause wins over the probe', () => {
    expect(resolveEffectiveConnection('disconnected', 'network', true)).toEqual({
      status: 'disconnected',
      cause: 'network',
      saveOutage: false,
    });
    expect(resolveEffectiveConnection('reconnecting', 'network', true)).toEqual({
      status: 'reconnecting',
      cause: 'network',
      saveOutage: false,
    });
  });

  it('passes the state through unchanged when the backend is healthy', () => {
    expect(resolveEffectiveConnection('connected', null, false)).toEqual({
      status: 'connected',
      cause: null,
      saveOutage: false,
    });
  });
});
