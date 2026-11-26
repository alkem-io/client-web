import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const notifyMock = vi.fn();
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notifyMock }));

import { useClassificationPicker } from './useClassificationPicker';

describe('useClassificationPicker', () => {
  it('shows the feature-not-enabled notice and reads nothing until template values have a designed read', () => {
    const { result } = renderHook(() => useClassificationPicker('root'));
    result.current.openPicker();
    expect(notifyMock).toHaveBeenCalledWith('apollo.errors.userMessages.operations.notEnabled', 'error');
    expect(result.current.open).toBe(false);
    expect(result.current.sources).toEqual([]);
  });
});
