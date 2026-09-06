import type { SettingsFlow } from '@ory/kratos-client';
import { describe, expect, it } from 'vitest';
import { securitySettingsResumeTarget } from './settingsFlowSecurityReturn';

const ORIGIN = 'http://localhost:3000';

const buildFlow = (overrides: Partial<SettingsFlow>): SettingsFlow =>
  ({
    id: '4be070e3-fce2-4b09-897a-8215833c1831',
    ui: { action: `${ORIGIN}/self-service/settings?flow=4be070e3`, method: 'POST', nodes: [], messages: [] },
    ...overrides,
  }) as unknown as SettingsFlow;

describe('securitySettingsResumeTarget', () => {
  it('routes a flow whose return_to targets the Security settings page back there, carrying the flow id', () => {
    const flow = buildFlow({ return_to: `${ORIGIN}/user/s1-p1/settings/security` });
    expect(securitySettingsResumeTarget(flow, ORIGIN)).toBe(
      '/user/s1-p1/settings/security?flow=4be070e3-fce2-4b09-897a-8215833c1831'
    );
  });

  it('preserves existing query params on the return_to while setting the flow id', () => {
    const flow = buildFlow({ return_to: `${ORIGIN}/user/s1-p1/settings/security?tab=connected` });
    expect(securitySettingsResumeTarget(flow, ORIGIN)).toBe(
      '/user/s1-p1/settings/security?tab=connected&flow=4be070e3-fce2-4b09-897a-8215833c1831'
    );
  });

  it('resolves a relative return_to against the origin', () => {
    const flow = buildFlow({ return_to: '/user/s1-p1/settings/security' });
    expect(securitySettingsResumeTarget(flow, ORIGIN)).toBe(
      '/user/s1-p1/settings/security?flow=4be070e3-fce2-4b09-897a-8215833c1831'
    );
  });

  it('falls back to the return_to recorded on request_url when the flow carries no return_to field', () => {
    const flow = buildFlow({
      return_to: undefined,
      request_url: `${ORIGIN}/self-service/settings/browser?return_to=${encodeURIComponent(
        `${ORIGIN}/user/s1-p1/settings/security`
      )}`,
    });
    expect(securitySettingsResumeTarget(flow, ORIGIN)).toBe(
      '/user/s1-p1/settings/security?flow=4be070e3-fce2-4b09-897a-8215833c1831'
    );
  });

  it('returns null for a recovery-issued flow (no return_to anywhere)', () => {
    const flow = buildFlow({ return_to: undefined, request_url: `${ORIGIN}/self-service/settings/browser` });
    expect(securitySettingsResumeTarget(flow, ORIGIN)).toBeNull();
  });

  it('returns null when return_to is not a Security settings page', () => {
    const flow = buildFlow({ return_to: `${ORIGIN}/home` });
    expect(securitySettingsResumeTarget(flow, ORIGIN)).toBeNull();
  });

  it('returns null for a cross-origin return_to', () => {
    const flow = buildFlow({ return_to: 'https://evil.example/user/s1-p1/settings/security' });
    expect(securitySettingsResumeTarget(flow, ORIGIN)).toBeNull();
  });

  it('returns null for an unparsable request_url', () => {
    const flow = buildFlow({ return_to: undefined, request_url: 'not a url' });
    expect(securitySettingsResumeTarget(flow, ORIGIN)).toBeNull();
  });
});
