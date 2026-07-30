import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { InnovationHubSettingsFragment, InnovationHubSpaceFragment } from '@/core/apollo/generated/graphql-schema';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';

const updateInnovationHubMock = vi.fn();
const mutationLoading = { current: false };
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateInnovationHubMutation: () => [updateInnovationHubMock, { loading: mutationLoading.current }] as const,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccess(...args), error: (...args: unknown[]) => toastError(...args) },
}));

const { useHubSpacesTabData } = await import('../hooks/useHubSpacesTabData');

const makeSpace = (
  id: string,
  displayName: string,
  visibility: SpaceVisibility = SpaceVisibility.Active
): InnovationHubSpaceFragment => ({
  __typename: 'Space',
  id,
  visibility,
  about: {
    __typename: 'SpaceAbout',
    id: `about-${id}`,
    provider: {
      __typename: 'Actor',
      id: `p-${id}`,
      profile: { __typename: 'Profile', id: `pp-${id}`, displayName: 'Acme' },
    },
    profile: { __typename: 'Profile', id: `prof-${id}`, displayName, url: `/space/${id}` },
  },
});

const makeHub = (spaces: InnovationHubSpaceFragment[]): InnovationHubSettingsFragment =>
  ({ id: 'hub-1', spaceListFilter: spaces }) as unknown as InnovationHubSettingsFragment;

const refetch = vi.fn(() => Promise.resolve());

beforeEach(() => {
  updateInnovationHubMock.mockReset();
  updateInnovationHubMock.mockResolvedValue({ data: { updateInnovationHub: { id: 'hub-1' } } });
  refetch.mockClear();
  toastSuccess.mockClear();
  toastError.mockClear();
  mutationLoading.current = false;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useHubSpacesTabData', () => {
  test('maps spaceListFilter to rows with resolved visibility labels', () => {
    const hub = makeHub([
      makeSpace('s1', 'Alpha', SpaceVisibility.Active),
      makeSpace('s2', 'Beta', SpaceVisibility.Demo),
    ]);
    const { result } = renderHook(() => useHubSpacesTabData(hub, refetch));

    expect(result.current.rows).toHaveLength(2);
    expect(result.current.rows[0]).toMatchObject({
      id: 's1',
      name: 'Alpha',
      visibility: 'active',
      visibilityLabel: 'settings.spaces.visibility.active',
    });
    expect(result.current.rows[1]).toMatchObject({
      id: 's2',
      visibility: 'demo',
      visibilityLabel: 'settings.spaces.visibility.demo',
    });
  });

  test('rows is empty when the hub is undefined', () => {
    const { result } = renderHook(() => useHubSpacesTabData(undefined, refetch));
    expect(result.current.rows).toEqual([]);
  });

  test('add appends the id, sends the mutation + refetch, then a success toast', async () => {
    const hub = makeHub([makeSpace('s1', 'Alpha')]);
    const { result } = renderHook(() => useHubSpacesTabData(hub, refetch));

    await act(async () => {
      await result.current.add('s2');
    });

    expect(updateInnovationHubMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { hubData: { ID: 'hub-1', spaceListFilter: ['s1', 's2'] } } })
    );
    // The optimistic list only carries spaces we already have full data for (s1);
    // the freshly-added s2 is filled in by the refetch, not faked as a phantom row.
    expect(updateInnovationHubMock.mock.calls[0][0].optimisticResponse.updateInnovationHub.spaceListFilter).toEqual([
      expect.objectContaining({ id: 's1' }),
    ]);
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith('settings.spaces.toast.added');
    expect(toastError).not.toHaveBeenCalled();
  });

  test('add is a no-op when the space is already in the list', async () => {
    const hub = makeHub([makeSpace('s1', 'Alpha')]);
    const { result } = renderHook(() => useHubSpacesTabData(hub, refetch));

    await act(async () => {
      await result.current.add('s1');
    });

    expect(updateInnovationHubMock).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
  });

  test('remove drops the id and reports removal', async () => {
    const hub = makeHub([makeSpace('s1', 'Alpha'), makeSpace('s2', 'Beta')]);
    const { result } = renderHook(() => useHubSpacesTabData(hub, refetch));

    await act(async () => {
      await result.current.remove('s1');
    });

    expect(updateInnovationHubMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { hubData: { ID: 'hub-1', spaceListFilter: ['s2'] } } })
    );
    expect(toastSuccess).toHaveBeenCalledWith('settings.spaces.toast.removed');
  });

  test('reorder writes exactly the given order and reports reordering', async () => {
    const hub = makeHub([makeSpace('s1', 'Alpha'), makeSpace('s2', 'Beta')]);
    const { result } = renderHook(() => useHubSpacesTabData(hub, refetch));

    await act(async () => {
      await result.current.reorder(['s2', 's1']);
    });

    expect(updateInnovationHubMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { hubData: { ID: 'hub-1', spaceListFilter: ['s2', 's1'] } } })
    );
    expect(toastSuccess).toHaveBeenCalledWith('settings.spaces.toast.reordered');
  });

  test('busy reflects the mutation loading state', () => {
    mutationLoading.current = true;
    const { result } = renderHook(() => useHubSpacesTabData(makeHub([]), refetch));
    expect(result.current.busy).toBe(true);
  });

  test('surfaces a toast.error (and does not throw) when the mutation fails', async () => {
    updateInnovationHubMock.mockRejectedValue(new Error('boom'));
    const hub = makeHub([makeSpace('s1', 'Alpha')]);
    const { result } = renderHook(() => useHubSpacesTabData(hub, refetch));

    await act(async () => {
      await result.current.add('s2');
    });

    await waitFor(() => expect(toastError).toHaveBeenCalledWith('settings.spaces.toast.error boom'));
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
  });

  test('mutating handlers are no-ops when the hub is undefined', async () => {
    const { result } = renderHook(() => useHubSpacesTabData(undefined, refetch));

    await act(async () => {
      await result.current.add('s2');
      await result.current.remove('s1');
    });

    expect(updateInnovationHubMock).not.toHaveBeenCalled();
  });
});
