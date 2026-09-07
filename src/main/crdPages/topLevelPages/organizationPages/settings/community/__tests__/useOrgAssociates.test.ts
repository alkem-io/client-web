import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

// ─── Hook mocks ───────────────────────────────────────────────────────────

const mockAssignRoleToUser = vi.fn();
const mockRemoveRoleFromUser = vi.fn();
const mockFetchMore = vi.fn();
const usersByRoleState: Record<string, Array<{ id: string; profile: { displayName: string } }>> = {};
// Privileges the mocked role-set manager reports. Default is permitted, so the
// existing specs exercise the happy path; the gating block overrides it.
let mockMyPrivileges: string[] | undefined = ['ROLESET_ENTRY_ROLE_ASSIGN'];
let mockManagerLoading = false;
let mockManagerUpdating = false;
let mockAvailableLoading = false;
let mockAvailableHasMore = false;
let mockAvailableUsers: Array<{ id: string; profile: { displayName: string } }> = [];
const lastAvailableArgs: Array<unknown> = [];

vi.mock('@/domain/access/RoleSetManager/useRoleSetManager', () => ({
  default: vi.fn(() => ({
    usersByRole: usersByRoleState,
    assignRoleToUser: mockAssignRoleToUser,
    removeRoleFromUser: mockRemoveRoleFromUser,
    loading: mockManagerLoading,
    updating: mockManagerUpdating,
    myPrivileges: mockMyPrivileges,
  })),
}));

vi.mock('@/domain/access/AvailableContributors/useRoleSetAvailableUsers', () => ({
  default: vi.fn((args: unknown) => {
    lastAvailableArgs.push(args);
    return {
      users: mockAvailableUsers,
      hasMore: mockAvailableHasMore,
      loading: mockAvailableLoading,
      fetchMore: mockFetchMore,
    };
  }),
}));

import useOrgAssociates from '../useOrgAssociates';

// ─── Lifecycle ────────────────────────────────────────────────────────────

beforeEach(() => {
  mockAssignRoleToUser.mockReset().mockResolvedValue(undefined);
  mockRemoveRoleFromUser.mockReset().mockResolvedValue(undefined);
  mockFetchMore.mockReset().mockResolvedValue(undefined);
  for (const k of Object.keys(usersByRoleState)) delete usersByRoleState[k];
  mockMyPrivileges = ['ROLESET_ENTRY_ROLE_ASSIGN'];
  mockManagerLoading = false;
  mockManagerUpdating = false;
  mockAvailableLoading = false;
  mockAvailableHasMore = false;
  mockAvailableUsers = [];
  lastAvailableArgs.length = 0;
});

afterEach(() => vi.useRealTimers());

// ─── Tests ────────────────────────────────────────────────────────────────

describe('useOrgAssociates — Add (immediate)', () => {
  it('fires assignRoleToUser with the Associate role on click — no dialog (FR-110)', async () => {
    const { result } = renderHook(() => useOrgAssociates('rs-1'));

    await act(async () => {
      await result.current.onAdd('user-1');
    });

    expect(mockAssignRoleToUser).toHaveBeenCalledTimes(1);
    expect(mockAssignRoleToUser).toHaveBeenCalledWith('user-1', RoleName.Associate);
  });
});

describe('useOrgAssociates — Remove with confirmation (Q2 / Rule #9 / FR-112)', () => {
  it('Request → Confirm → fires removeRoleFromUser; pendingRemove clears', async () => {
    const { result } = renderHook(() => useOrgAssociates('rs-1'));

    act(() => result.current.onRequestRemove('user-1', 'Maria S.'));
    expect(result.current.pendingRemove).toEqual({ contributorId: 'user-1', displayName: 'Maria S.' });

    await act(async () => {
      await result.current.onConfirmRemove();
    });

    expect(mockRemoveRoleFromUser).toHaveBeenCalledWith('user-1', RoleName.Associate);
    expect(result.current.pendingRemove).toBeNull();
  });

  it('Request → Cancel does NOT fire removeRoleFromUser', () => {
    const { result } = renderHook(() => useOrgAssociates('rs-1'));

    act(() => result.current.onRequestRemove('user-1', 'Bob'));
    expect(result.current.pendingRemove).not.toBeNull();

    act(() => result.current.onCancelRemove());
    expect(result.current.pendingRemove).toBeNull();
    expect(mockRemoveRoleFromUser).not.toHaveBeenCalled();
  });
});

describe('useOrgAssociates — search & pagination passthrough', () => {
  it('uses mode: "platform" (US10) — Associates can be onboarded from any platform user', () => {
    renderHook(() => useOrgAssociates('rs-1'));
    const last = lastAvailableArgs[lastAvailableArgs.length - 1] as { mode: string };
    expect(last.mode).toBe('platform');
  });

  it('onSearchChange updates the searchTerm', async () => {
    const { result } = renderHook(() => useOrgAssociates('rs-1'));
    act(() => result.current.onSearchChange('garden'));
    await waitFor(() => expect(result.current.searchTerm).toBe('garden'));
  });

  it('onLoadMore proxies to the available-users fetchMore', async () => {
    const { result } = renderHook(() => useOrgAssociates('rs-1'));
    await act(async () => {
      await result.current.onLoadMore();
    });
    expect(mockFetchMore).toHaveBeenCalledTimes(1);
  });
});

describe('useOrgAssociates permission gating', () => {
  // spec FR-002 — assignRoleToUser/removeRoleFromUser are gated on the privilege the
  // backend enforces for those mutations.
  it('reports no disabled reason when the assign privilege is held', () => {
    mockMyPrivileges = ['ROLESET_ENTRY_ROLE_ASSIGN'];
    const { result } = renderHook(() => useOrgAssociates('rs-1'));

    expect(result.current.addDisabledReason).toBeUndefined();
    expect(result.current.removeDisabledReason).toBeUndefined();
  });

  it('gates add and remove when the privilege is absent', () => {
    mockMyPrivileges = ['READ'];
    const { result } = renderHook(() => useOrgAssociates('rs-1'));

    expect(result.current.addDisabledReason).toBe('permissions.denied');
    expect(result.current.removeDisabledReason).toBe('permissions.denied');
  });

  // spec FR-008 / SC-006 — never interactive before privileges are known
  it('gates with the checking reason while privileges load', () => {
    mockManagerLoading = true;
    const { result } = renderHook(() => useOrgAssociates('rs-1'));

    expect(result.current.addDisabledReason).toBe('permissions.checking');
  });

  // spec Edge Case 3 — completed query that carried no privilege list
  it('gates with the unverifiable reason when privileges are missing', () => {
    mockMyPrivileges = undefined;
    const { result } = renderHook(() => useOrgAssociates('rs-1'));

    expect(result.current.addDisabledReason).toBe('permissions.unverifiable');
  });
});
