import { act, renderHook } from '@testing-library/react';
import type { MouseEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const notify = vi.fn();
const deleteSpace = vi.fn();
let mutationOptions: { onCompleted?: () => void; onError?: () => void } = {};
let deleting = false;

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceAccountQuery: () => ({ data: undefined, loading: false }),
  useDeleteSpaceMutation: (options: typeof mutationOptions) => {
    mutationOptions = options;
    return [deleteSpace, { loading: deleting }];
  },
}));

import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { useAccountTabData } from './useAccountTabData';

describe('useAccountTabData — delete outcome (spec 045 FR-024a)', () => {
  const replace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    deleting = false;
    vi.stubGlobal('location', { ...window.location, replace });
  });

  const confirmEvent = () => ({ preventDefault: vi.fn() }) as unknown as MouseEvent<HTMLButtonElement>;

  it('deletes only after confirmation, keeping the dialog open while it runs', () => {
    const { result } = renderHook(() => useAccountTabData('space-1'));

    act(() => result.current.onDeleteSpace());
    expect(result.current.pendingDeleteSpace).toBe(true);
    expect(deleteSpace).not.toHaveBeenCalled();

    const event = confirmEvent();
    act(() => result.current.confirmDeleteSpace(event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(deleteSpace).toHaveBeenCalledWith({ variables: { spaceId: 'space-1' } });
    expect(result.current.pendingDeleteSpace).toBe(true);
  });

  it('ignores a second confirm and cancel while the delete is in flight', () => {
    deleting = true;
    const { result } = renderHook(() => useAccountTabData('space-1'));

    act(() => result.current.onDeleteSpace());
    act(() => result.current.confirmDeleteSpace(confirmEvent()));
    act(() => result.current.cancelDeleteSpace());

    expect(deleteSpace).not.toHaveBeenCalled();
    expect(result.current.pendingDeleteSpace).toBe(true);
  });

  it('hard-navigates to Home once the space is deleted', () => {
    renderHook(() => useAccountTabData('space-1'));

    mutationOptions.onCompleted?.();

    expect(replace).toHaveBeenCalledWith(ROUTE_HOME);
    expect(notify).not.toHaveBeenCalled();
  });

  it('reports a failed delete, closes the dialog and stays on the tab', () => {
    const { result } = renderHook(() => useAccountTabData('space-1'));
    act(() => result.current.onDeleteSpace());

    act(() => mutationOptions.onError?.());

    expect(result.current.pendingDeleteSpace).toBe(false);
    expect(notify).toHaveBeenCalledWith('account.dangerZone.deleteError', 'error');
    expect(replace).not.toHaveBeenCalled();
  });
});
