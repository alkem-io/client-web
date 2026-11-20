import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigate = vi.fn();
let permissions = { canEdit: false, canReadUsers: false, canManageCommunityAsSupport: false };
let loading = false;

vi.mock('@/domain/community/organization/useOrganization/useOrganization', () => ({
  default: () => ({ permissions, loading }),
}));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => navigate }));

import useOrgSettingsAccessGuard from './settings/useOrgSettingsAccessGuard';
import useCanEditOrganizationSettings from './useCanEditOrganizationSettings';

beforeEach(() => {
  vi.clearAllMocks();
  permissions = { canEdit: false, canReadUsers: false, canManageCommunityAsSupport: false };
  loading = false;
});

describe('useCanEditOrganizationSettings — access mode', () => {
  it('Update on the organization → full access', () => {
    permissions = { ...permissions, canEdit: true };
    const { result } = renderHook(() => useCanEditOrganizationSettings());

    expect(result.current).toMatchObject({ accessMode: 'full', canEditSettings: true, hasUpdatePrivilege: true });
  });

  it('Update wins over the Support path: an admin who is also Support keeps full access', () => {
    permissions = { ...permissions, canEdit: true, canManageCommunityAsSupport: true };
    const { result } = renderHook(() => useCanEditOrganizationSettings());

    expect(result.current.accessMode).toBe('full');
  });

  it('Support only → community-only, which still admits the viewer to the shell', () => {
    permissions = { ...permissions, canManageCommunityAsSupport: true };
    const { result } = renderHook(() => useCanEditOrganizationSettings());

    expect(result.current).toMatchObject({
      accessMode: 'community-only',
      canEditSettings: true,
      hasUpdatePrivilege: false,
    });
  });

  it('neither → none, and the shell guard still redirects to the public profile', () => {
    const { result } = renderHook(() => useOrgSettingsAccessGuard({ profileUrl: '/organization/acme' }));

    expect(result.current).toMatchObject({ accessMode: 'none', canEditSettings: false });
    expect(navigate).toHaveBeenCalledWith('/organization/acme', { replace: true });
  });

  it('the guard lets a community-only viewer stay', () => {
    permissions = { ...permissions, canManageCommunityAsSupport: true };
    renderHook(() => useOrgSettingsAccessGuard({ profileUrl: '/organization/acme' }));

    expect(navigate).not.toHaveBeenCalled();
  });

  it('the guard does not redirect while the privileges are loading', () => {
    loading = true;
    renderHook(() => useOrgSettingsAccessGuard({ profileUrl: '/organization/acme' }));

    expect(navigate).not.toHaveBeenCalled();
  });
});
