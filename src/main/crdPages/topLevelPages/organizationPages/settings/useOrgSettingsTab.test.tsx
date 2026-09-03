import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import useOrgSettingsTab from './useOrgSettingsTab';

const wrapper =
  (path: string) =>
  ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>;

describe('useOrgSettingsTab — invitations tab (T011, contract §4)', () => {
  it('resolves /organization/x/settings/invitations to "invitations", not the profile fallback', () => {
    const { result } = renderHook(() => useOrgSettingsTab({ profileUrl: '/organization/x' }), {
      wrapper: wrapper('/organization/x/settings/invitations'),
    });
    expect(result.current.activeTabId).toBe('invitations');
  });

  it('still falls back to "profile" for an unknown tab segment', () => {
    const { result } = renderHook(() => useOrgSettingsTab({ profileUrl: '/organization/x' }), {
      wrapper: wrapper('/organization/x/settings/unknown-tab'),
    });
    expect(result.current.activeTabId).toBe('profile');
  });

  it('still resolves the other existing tabs unaffected', () => {
    const { result } = renderHook(() => useOrgSettingsTab({ profileUrl: '/organization/x' }), {
      wrapper: wrapper('/organization/x/settings/community'),
    });
    expect(result.current.activeTabId).toBe('community');
  });
});
