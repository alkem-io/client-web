import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

// ─── Hook mocks ───────────────────────────────────────────────────────────

const mockAssignRoleToUser = vi.fn();
const mockRemoveRoleFromUser = vi.fn();
const mockFetchMore = vi.fn();
const usersByRoleState: Record<string, Array<{ id: string; profile: { displayName: string } }>> = {};
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

import useOrgRoleAssignment from '../useOrgRoleAssignment';

// ─── Lifecycle ────────────────────────────────────────────────────────────

beforeEach(() => {
  mockAssignRoleToUser.mockReset().mockResolvedValue(undefined);
  mockRemoveRoleFromUser.mockReset().mockResolvedValue(undefined);
  mockFetchMore.mockReset().mockResolvedValue(undefined);
  for (const k of Object.keys(usersByRoleState)) delete usersByRoleState[k];
  mockManagerLoading = false;
  mockManagerUpdating = false;
  mockAvailableLoading = false;
  mockAvailableHasMore = false;
  mockAvailableUsers = [];
  lastAvailableArgs.length = 0;
});

afterEach(() => vi.useRealTimers());

// ─── Tests ────────────────────────────────────────────────────────────────

describe('useOrgRoleAssignment — Add', () => {
  it('fires assignRoleToUser immediately for the Admin role (no confirmation)', async () => {
    const { result } = renderHook(() => useOrgRoleAssignment('rs-1', RoleName.Admin));

    await act(async () => {
      await result.current.onAdd('user-1');
    });

    expect(mockAssignRoleToUser).toHaveBeenCalledTimes(1);
    expect(mockAssignRoleToUser).toHaveBeenCalledWith('user-1', RoleName.Admin);
    expect(result.current.pendingRemove).toBeNull();
  });

  it('fires assignRoleToUser immediately for the Owner role (no confirmation)', async () => {
    const { result } = renderHook(() => useOrgRoleAssignment('rs-1', RoleName.Owner));

    await act(async () => {
      await result.current.onAdd('user-2');
    });

    expect(mockAssignRoleToUser).toHaveBeenCalledWith('user-2', RoleName.Owner);
  });
});

describe('useOrgRoleAssignment — Remove with confirmation (Q2 / Rule #9 / FR-121)', () => {
  it('Request → Confirm → fires removeRoleFromUser with the bound role', async () => {
    const { result } = renderHook(() => useOrgRoleAssignment('rs-1', RoleName.Admin));

    act(() => {
      result.current.onRequestRemove('user-1', 'Maria S.');
    });

    expect(result.current.pendingRemove).toEqual({ contributorId: 'user-1', displayName: 'Maria S.' });
    expect(mockRemoveRoleFromUser).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.onConfirmRemove();
    });

    expect(mockRemoveRoleFromUser).toHaveBeenCalledTimes(1);
    expect(mockRemoveRoleFromUser).toHaveBeenCalledWith('user-1', RoleName.Admin);
    expect(result.current.pendingRemove).toBeNull();
  });

  it('Request → Cancel does NOT fire removeRoleFromUser', () => {
    const { result } = renderHook(() => useOrgRoleAssignment('rs-1', RoleName.Owner));

    act(() => result.current.onRequestRemove('user-1', 'Bob L.'));
    expect(result.current.pendingRemove).not.toBeNull();

    act(() => result.current.onCancelRemove());
    expect(result.current.pendingRemove).toBeNull();
    expect(mockRemoveRoleFromUser).not.toHaveBeenCalled();
  });

  it('Owner-role removal binds the Owner role (not Admin) on confirm', async () => {
    const { result } = renderHook(() => useOrgRoleAssignment('rs-1', RoleName.Owner));

    act(() => result.current.onRequestRemove('user-3', 'Carla T.'));
    await act(async () => {
      await result.current.onConfirmRemove();
    });

    expect(mockRemoveRoleFromUser).toHaveBeenCalledWith('user-3', RoleName.Owner);
  });
});

describe('useOrgRoleAssignment — search & pagination passthrough', () => {
  it('onSearchChange updates the searchTerm exposed to the available-users hook', async () => {
    const { result } = renderHook(() => useOrgRoleAssignment('rs-1', RoleName.Admin));

    expect(result.current.searchTerm).toBe('');

    act(() => result.current.onSearchChange('maria'));
    await waitFor(() => {
      expect(result.current.searchTerm).toBe('maria');
    });
  });

  it('uses mode: "roleSet" — matches the existing MUI Authorization page behaviour', () => {
    renderHook(() => useOrgRoleAssignment('rs-1', RoleName.Admin));
    const last = lastAvailableArgs.at(-1) as { mode: string; role: RoleName };
    expect(last.mode).toBe('roleSet');
    expect(last.role).toBe(RoleName.Admin);
  });

  it('onLoadMore proxies through to the available-users hook fetchMore', async () => {
    const { result } = renderHook(() => useOrgRoleAssignment('rs-1', RoleName.Owner));

    await act(async () => {
      await result.current.onLoadMore();
    });

    expect(mockFetchMore).toHaveBeenCalledTimes(1);
  });
});
