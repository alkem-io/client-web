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

import useOrgAssociates from '../useOrgAssociates';

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
    const last = lastAvailableArgs.at(-1) as { mode: string };
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
