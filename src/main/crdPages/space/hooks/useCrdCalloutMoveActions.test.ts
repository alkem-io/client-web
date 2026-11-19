import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const sortOrderOptions = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateCalloutsSortOrderMutation: (options: unknown) => {
    sortOrderOptions(options);
    return [vi.fn(), { loading: false }];
  },
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

import { useCrdCalloutMoveActions } from './useCrdCalloutMoveActions';

describe('useCrdCalloutMoveActions', () => {
  it('leaves a refused move to its own moveFailed message', () => {
    renderHook(() =>
      useCrdCalloutMoveActions({ calloutsSetId: 'set-1', orderedCalloutIds: ['a', 'b'], calloutId: 'a' })
    );

    expect(sortOrderOptions.mock.calls[0][0].context).toEqual({ skipGlobalErrorHandler: true });
  });
});
