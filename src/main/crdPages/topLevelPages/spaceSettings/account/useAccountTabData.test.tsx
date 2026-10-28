import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const notify = vi.fn();
const deleteSpace = vi.fn();
let mutationOptions: { onCompleted?: () => void; onError?: () => void } = {};

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceAccountQuery: () => ({ data: undefined, loading: false }),
  useDeleteSpaceMutation: (options: typeof mutationOptions) => {
    mutationOptions = options;
    return [deleteSpace];
  },
}));

import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { useAccountTabData } from './useAccountTabData';

describe('useAccountTabData — delete outcome (spec 045 FR-024a)', () => {
  const replace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('location', { ...window.location, replace });
  });

  it('deletes only after confirmation', () => {
    const { result } = renderHook(() => useAccountTabData('space-1'));

    act(() => result.current.onDeleteSpace());
    expect(result.current.pendingDeleteSpace).toBe(true);
    expect(deleteSpace).not.toHaveBeenCalled();

    act(() => result.current.confirmDeleteSpace());
    expect(deleteSpace).toHaveBeenCalledWith({ variables: { spaceId: 'space-1' } });
    expect(result.current.pendingDeleteSpace).toBe(false);
  });

  it('hard-navigates to Home once the space is deleted', () => {
    renderHook(() => useAccountTabData('space-1'));

    mutationOptions.onCompleted?.();

    expect(replace).toHaveBeenCalledWith(ROUTE_HOME);
    expect(notify).not.toHaveBeenCalled();
  });

  it('reports a failed delete and stays on the tab', () => {
    renderHook(() => useAccountTabData('space-1'));

    mutationOptions.onError?.();

    expect(notify).toHaveBeenCalledWith('account.dangerZone.deleteError', 'error');
    expect(replace).not.toHaveBeenCalled();
  });
});
