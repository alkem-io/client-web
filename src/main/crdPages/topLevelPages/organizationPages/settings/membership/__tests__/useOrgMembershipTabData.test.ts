import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

const mockFetchSpaceDetails = vi.fn();
const mockRemoveRoleFromOrganization = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceContributionDetailsLazyQuery: () => [mockFetchSpaceDetails],
  useRemoveRoleFromOrganizationMutation: () => [mockRemoveRoleFromOrganization, { loading: false }],
}));

import useOrgMembershipTabData from '../useOrgMembershipTabData';

const roleSetResult = (roleSetID: string | undefined) => ({
  data: { lookup: { space: roleSetID ? { about: { membership: { roleSetID } } } : null } },
});

const SUBSPACE_LEAVE = { membershipId: 'sub-1', spaceId: 'sub-1', displayName: 'Garden Patch' };

beforeEach(() => {
  mockFetchSpaceDetails.mockReset().mockResolvedValue(roleSetResult('rs-sub'));
  mockRemoveRoleFromOrganization.mockReset().mockResolvedValue({ data: {} });
});

describe('useOrgMembershipTabData — Leave', () => {
  it('resolves the role set of the exact subspace and removes the organization as Member', async () => {
    const refetch = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useOrgMembershipTabData('org-1', refetch));
    act(() => {
      result.current.onRequestLeave(SUBSPACE_LEAVE);
    });

    await act(async () => {
      await result.current.onConfirmLeave();
    });

    expect(mockFetchSpaceDetails).toHaveBeenCalledWith({ variables: { spaceId: 'sub-1' } });
    expect(mockRemoveRoleFromOrganization).toHaveBeenCalledWith({
      variables: { contributorId: 'org-1', roleSetId: 'rs-sub', role: RoleName.Member },
    });
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(result.current.pendingLeave).toBeNull();
  });

  it('rejects without sending the mutation when the role set cannot be resolved, and refreshes the list', async () => {
    mockFetchSpaceDetails.mockResolvedValue(roleSetResult(undefined));
    const refetch = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useOrgMembershipTabData('org-1', refetch));
    act(() => {
      result.current.onRequestLeave(SUBSPACE_LEAVE);
    });

    await act(async () => {
      await expect(result.current.onConfirmLeave()).rejects.toThrow();
    });

    expect(mockRemoveRoleFromOrganization).not.toHaveBeenCalled();
    expect(result.current.pendingLeave).toBeNull();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('rejects when the mutation fails, still clearing the dialog and refreshing the list', async () => {
    mockRemoveRoleFromOrganization.mockRejectedValue(new Error('Authorization: unable to grant'));
    const refetch = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useOrgMembershipTabData('org-1', refetch));
    act(() => {
      result.current.onRequestLeave(SUBSPACE_LEAVE);
    });

    await act(async () => {
      await expect(result.current.onConfirmLeave()).rejects.toThrow('Authorization: unable to grant');
    });

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(result.current.pendingLeave).toBeNull();
  });

  it('resolves when the leave succeeded even though the refetch failed', async () => {
    const refetch = vi.fn().mockRejectedValue(new Error('Network blip'));
    const { result } = renderHook(() => useOrgMembershipTabData('org-1', refetch));
    act(() => {
      result.current.onRequestLeave(SUBSPACE_LEAVE);
    });

    await act(async () => {
      await expect(result.current.onConfirmLeave()).resolves.toBeUndefined();
    });

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(result.current.pendingLeave).toBeNull();
    expect(result.current.isLeaving).toBe(false);
  });

  it('rejects with the leave error, not the refetch error, when both fail', async () => {
    mockRemoveRoleFromOrganization.mockRejectedValue(new Error('Authorization: unable to grant'));
    const refetch = vi.fn().mockRejectedValue(new Error('Network blip'));
    const { result } = renderHook(() => useOrgMembershipTabData('org-1', refetch));
    act(() => {
      result.current.onRequestLeave(SUBSPACE_LEAVE);
    });

    await act(async () => {
      await expect(result.current.onConfirmLeave()).rejects.toThrow('Authorization: unable to grant');
    });
  });

  it('reports isLeaving for the whole sequence, from the role-set lookup until the list is refetched', async () => {
    let settleLookup: (value: unknown) => void = () => {};
    mockFetchSpaceDetails.mockReturnValue(
      new Promise(resolve => {
        settleLookup = resolve;
      })
    );
    let settleRefetch: (value: unknown) => void = () => {};
    const refetch = vi.fn().mockReturnValue(
      new Promise(resolve => {
        settleRefetch = resolve;
      })
    );
    const { result } = renderHook(() => useOrgMembershipTabData('org-1', refetch));
    act(() => {
      result.current.onRequestLeave(SUBSPACE_LEAVE);
    });
    expect(result.current.isLeaving).toBe(false);

    let confirming: Promise<void> = Promise.resolve();
    act(() => {
      confirming = result.current.onConfirmLeave();
    });
    expect(result.current.isLeaving).toBe(true);
    expect(result.current.pendingLeave).toEqual(SUBSPACE_LEAVE);

    await act(async () => {
      settleLookup(roleSetResult('rs-sub'));
    });
    expect(mockRemoveRoleFromOrganization).toHaveBeenCalledTimes(1);
    expect(result.current.isLeaving).toBe(true);
    expect(result.current.pendingLeave).toEqual(SUBSPACE_LEAVE);

    await act(async () => {
      settleRefetch(undefined);
      await confirming;
    });
    expect(result.current.isLeaving).toBe(false);
    expect(result.current.pendingLeave).toBeNull();
  });

  it('never clears a leave requested for another card while an earlier one was settling', async () => {
    let settleRemoval: (value: unknown) => void = () => {};
    mockRemoveRoleFromOrganization.mockReturnValue(
      new Promise(resolve => {
        settleRemoval = resolve;
      })
    );
    const OTHER_LEAVE = { membershipId: 'space-1', spaceId: 'space-1', displayName: 'Garden Space' };
    const { result } = renderHook(() => useOrgMembershipTabData('org-1'));
    act(() => {
      result.current.onRequestLeave(SUBSPACE_LEAVE);
    });

    let confirming: Promise<void> = Promise.resolve();
    await act(async () => {
      confirming = result.current.onConfirmLeave();
    });
    act(() => {
      result.current.onRequestLeave(OTHER_LEAVE);
    });
    await act(async () => {
      settleRemoval({ data: {} });
      await confirming;
    });

    expect(result.current.pendingLeave).toEqual(OTHER_LEAVE);
    expect(result.current.isLeaving).toBe(false);
  });

  it('removes the organization the leave was requested for, even if the page has moved to another', async () => {
    const { result, rerender } = renderHook(({ orgId }) => useOrgMembershipTabData(orgId), {
      initialProps: { orgId: 'org-1' },
    });
    act(() => {
      result.current.onRequestLeave(SUBSPACE_LEAVE);
    });
    rerender({ orgId: 'org-2' });

    await act(async () => {
      await result.current.onConfirmLeave();
    });

    expect(mockRemoveRoleFromOrganization).toHaveBeenCalledWith({
      variables: { contributorId: 'org-1', roleSetId: 'rs-sub', role: RoleName.Member },
    });
  });

  it('rejects rather than resolving when nothing is pending', async () => {
    const { result } = renderHook(() => useOrgMembershipTabData('org-1'));
    await act(async () => {
      await expect(result.current.onConfirmLeave()).rejects.toThrow();
    });
    expect(mockFetchSpaceDetails).not.toHaveBeenCalled();
    expect(mockRemoveRoleFromOrganization).not.toHaveBeenCalled();
  });

  it('cancel clears the pending leave without any request', () => {
    const refetch = vi.fn();
    const { result } = renderHook(() => useOrgMembershipTabData('org-1', refetch));
    act(() => {
      result.current.onRequestLeave(SUBSPACE_LEAVE);
    });
    expect(result.current.pendingLeave).toEqual(SUBSPACE_LEAVE);

    act(() => {
      result.current.onCancelLeave();
    });

    expect(result.current.pendingLeave).toBeNull();
    expect(mockFetchSpaceDetails).not.toHaveBeenCalled();
    expect(mockRemoveRoleFromOrganization).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
  });
});

describe('useOrgMembershipTabData — search / filter', () => {
  it('updates search and filter independently and clears both', () => {
    const { result } = renderHook(() => useOrgMembershipTabData('org-1'));
    act(() => {
      result.current.onSearchChange('garden');
      result.current.onFilterChange('subspaces');
    });
    expect(result.current.search).toBe('garden');
    expect(result.current.filter).toBe('subspaces');

    act(() => {
      result.current.onClearFilters();
    });
    expect(result.current.search).toBe('');
    expect(result.current.filter).toBe('all');
  });
});
