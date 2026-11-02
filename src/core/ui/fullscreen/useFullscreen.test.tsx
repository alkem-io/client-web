import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { useFullscreen } from './useFullscreen';

const setFullscreenElement = (element: Element | null) => {
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: element });
  document.dispatchEvent(new Event('fullscreenchange'));
};

afterEach(() => {
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null });
});

describe('useFullscreen', () => {
  test('reports fullscreen when its own element is the fullscreen element', () => {
    const { result } = renderHook(() => useFullscreen());

    act(() => setFullscreenElement(document.documentElement));

    expect(result.current.fullscreen).toBe(true);
  });

  test('does not report fullscreen when another element is fullscreen', () => {
    // A video or media viewer inside the page going fullscreen must not read as
    // page fullscreen — consumers hide the chat on it, which unmounts that very
    // element and makes the browser leave fullscreen at once.
    const video = document.createElement('video');
    document.body.appendChild(video);
    const { result } = renderHook(() => useFullscreen());

    act(() => setFullscreenElement(video));

    expect(result.current.fullscreen).toBe(false);
    video.remove();
  });

  test('stops reporting fullscreen once the browser leaves it', () => {
    const { result } = renderHook(() => useFullscreen());

    act(() => setFullscreenElement(document.documentElement));
    act(() => setFullscreenElement(null));

    expect(result.current.fullscreen).toBe(false);
  });
});
