/**
 * Regression test for corr-client-1: opening/browsing/closing the calendar
 * from a non-default tab must keep `?tab=N` in the URL, otherwise
 * CrdSpacePageLayout falls back to the default tab and — when that tab's
 * sidebar plan omits the `events` widget — the calendar dialog the user just
 * opened unmounts.
 */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('@/core/routing/useNavigate', () => ({
  default: () => mockNavigate,
}));

import { useCrdCalendarUrlState } from './useCrdCalendarUrlState';

function renderAt(path: string) {
  return renderHook(() => useCrdCalendarUrlState(), {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>,
  });
}

describe('useCrdCalendarUrlState — tab preservation across calendar navigation', () => {
  it('navigateToList keeps the current ?tab= param', () => {
    mockNavigate.mockClear();
    const { result } = renderAt('/spaces/foo/community?tab=2');

    result.current.navigateToList();

    expect(mockNavigate.mock.calls[0][0]).toBe('/spaces/foo/community/calendar?tab=2');
  });

  it('navigateToList with no ?tab= param navigates to the bare calendar path (unchanged behavior)', () => {
    mockNavigate.mockClear();
    const { result } = renderAt('/spaces/foo/community');

    result.current.navigateToList();

    expect(mockNavigate.mock.calls[0][0]).toBe('/spaces/foo/community/calendar');
  });

  it('navigateToEvent appends the current ?tab= param to the event URL', () => {
    mockNavigate.mockClear();
    const { result } = renderAt('/spaces/foo/community?tab=2');

    result.current.navigateToEvent('/spaces/foo/calendar/some-event');

    expect(mockNavigate.mock.calls[0][0]).toBe('/spaces/foo/calendar/some-event?tab=2');
  });

  it('navigateToCreate keeps ?tab= alongside ?new=1', () => {
    mockNavigate.mockClear();
    const { result } = renderAt('/spaces/foo/community?tab=2');

    result.current.navigateToCreate();

    const [calledPath] = mockNavigate.mock.calls[0];
    const [, search] = calledPath.split('?');
    const params = new URLSearchParams(search);
    expect(params.get('tab')).toBe('2');
    expect(params.get('new')).toBe('1');
  });

  it('navigateAwayFromCalendar keeps ?tab= when closing the dialog', () => {
    mockNavigate.mockClear();
    const { result } = renderAt('/spaces/foo/community/calendar?tab=2');

    result.current.navigateAwayFromCalendar();

    expect(mockNavigate.mock.calls[0][0]).toBe('/spaces/foo/community?tab=2');
  });
});
