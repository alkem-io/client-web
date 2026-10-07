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
      awaitRefetchQueries: true,
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
