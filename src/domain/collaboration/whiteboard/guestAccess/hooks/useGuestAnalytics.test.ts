import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGuestAnalytics } from './useGuestAnalytics';

const logInfo = vi.fn();
const breadcrumb = vi.fn();

vi.mock('@/core/logging/sentry/log', () => ({
  info: (...args: unknown[]) => logInfo(...args),
  breadcrumb: (...args: unknown[]) => breadcrumb(...args),
  TagCategoryValues: { WHITEBOARD: 'whiteboard' },
}));

const trackEverything = () => {
  // No ApmProvider: the agent is undefined, as for a visitor without analysis consent.
  const { result } = renderHook(() => useGuestAnalytics());

  result.current.trackGuestNameSubmitted('Ada', false);
  result.current.trackWhiteboardLoadSuccess('wb-1', 'Ada');
  result.current.trackWhiteboardLoadFailure('wb-1', 'boom');
  result.current.trackDialogDismissed('wb-1');
  result.current.trackDerivedNameUsed('wb-1', 'Ada', 'first_only');
};

beforeEach(() => {
  logInfo.mockClear();
  breadcrumb.mockClear();
});

describe('useGuestAnalytics', () => {
  it('does not throw when the APM agent never started', () => {
    expect(trackEverything).not.toThrow();
  });

  it('puts usage events on the consent-gated breadcrumb trail and reports only the failed load', () => {
    trackEverything();

    expect(breadcrumb).toHaveBeenCalledTimes(4);
    expect(logInfo).toHaveBeenCalledExactlyOnceWith(
      'Guest whiteboard load failed: wb-1 - boom',
      expect.objectContaining({ label: 'whiteboard_load_failure' })
    );
  });

  it('sends no guest name to Sentry', () => {
    trackEverything();

    const sentToSentry = JSON.stringify([...breadcrumb.mock.calls, ...logInfo.mock.calls]);
    expect(sentToSentry).not.toContain('Ada');
  });
});
