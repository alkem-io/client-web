import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGuestAnalytics } from './useGuestAnalytics';

const logInfo = vi.fn();

vi.mock('@/core/logging/sentry/log', () => ({
  info: (...args: unknown[]) => logInfo(...args),
  TagCategoryValues: { WHITEBOARD: 'whiteboard' },
}));

describe('useGuestAnalytics', () => {
  it('logs every event and does not throw when the APM agent never started', () => {
    // No ApmProvider: the agent is undefined, as for a visitor without analysis consent.
    const { result } = renderHook(() => useGuestAnalytics());

    result.current.trackGuestNameSubmitted('Ada', false);
    result.current.trackWhiteboardLoadSuccess('wb-1', 'Ada');
    result.current.trackWhiteboardLoadFailure('wb-1', 'boom');
    result.current.trackDialogDismissed('wb-1');
    result.current.trackDerivedNameUsed('wb-1', 'Ada', 'first_only');

    expect(logInfo).toHaveBeenCalledTimes(5);
  });
});
