import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useVisibleViewportArea } from './useVisibleViewportArea';

const stubVisualViewport = (offsetTop: number, height: number) => {
  const viewport = Object.assign(new EventTarget(), { offsetTop, height });
  vi.stubGlobal('visualViewport', viewport);
  return viewport;
};

describe('useVisibleViewportArea', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test.each(['resize', 'scroll'])('follows the visual viewport on %s', eventName => {
    const viewport = stubVisualViewport(0, 844);
    const { result } = renderHook(() => useVisibleViewportArea(true));
    expect(result.current).toEqual({ top: 0, height: 844 });

    // The on-screen keyboard opens and iOS pans the page.
    Object.assign(viewport, { offsetTop: 24, height: 460 });
    act(() => {
      viewport.dispatchEvent(new Event(eventName));
    });
    expect(result.current).toEqual({ top: 24, height: 460 });
  });

  test('reports nothing while disabled, and does not listen', () => {
    const viewport = stubVisualViewport(0, 844);
    const addEventListener = vi.spyOn(viewport, 'addEventListener');
    const { result } = renderHook(() => useVisibleViewportArea(false));

    expect(result.current).toBeUndefined();
    expect(addEventListener).not.toHaveBeenCalled();
  });

  test('drops the area it measured once it is disabled, and stops listening', () => {
    const viewport = stubVisualViewport(0, 460);
    const { result, rerender } = renderHook(({ enabled }) => useVisibleViewportArea(enabled), {
      initialProps: { enabled: true },
    });
    expect(result.current).toEqual({ top: 0, height: 460 });

    rerender({ enabled: false });
    expect(result.current).toBeUndefined();

    Object.assign(viewport, { offsetTop: 0, height: 844 });
    act(() => {
      viewport.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBeUndefined();
  });

  test('reports nothing in a browser without a visual viewport', () => {
    vi.stubGlobal('visualViewport', undefined);
    const { result } = renderHook(() => useVisibleViewportArea(true));

    expect(result.current).toBeUndefined();
  });
});
