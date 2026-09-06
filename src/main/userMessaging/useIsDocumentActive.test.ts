import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIsDocumentActive } from './useIsDocumentActive';

let visibility: DocumentVisibilityState = 'visible';
let focused = true;

const fireVisibilityChange = () => act(() => void document.dispatchEvent(new Event('visibilitychange')));
const fireWindow = (type: 'focus' | 'blur') => act(() => void window.dispatchEvent(new Event(type)));

beforeEach(() => {
  visibility = 'visible';
  focused = true;

  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => visibility,
  });
  vi.spyOn(document, 'hasFocus').mockImplementation(() => focused);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useIsDocumentActive', () => {
  it('is active when the document is visible and focused', () => {
    const { result } = renderHook(() => useIsDocumentActive());
    expect(result.current).toBe(true);
  });

  it('is inactive when the document is hidden', () => {
    visibility = 'hidden';
    const { result } = renderHook(() => useIsDocumentActive());
    expect(result.current).toBe(false);
  });

  it('is inactive when the window is blurred even though the tab is visible', () => {
    const { result } = renderHook(() => useIsDocumentActive());

    focused = false;
    // The walked-away case: no visibilitychange fires, only blur. Tracking
    // visibility alone would miss this entirely.
    fireWindow('blur');

    expect(result.current).toBe(false);
  });

  it('goes active again on focus', () => {
    focused = false;
    const { result } = renderHook(() => useIsDocumentActive());
    expect(result.current).toBe(false);

    focused = true;
    fireWindow('focus');

    expect(result.current).toBe(true);
  });

  it('reacts to visibility changes independently of focus', () => {
    const { result } = renderHook(() => useIsDocumentActive());

    visibility = 'hidden';
    fireVisibilityChange();
    expect(result.current).toBe(false);

    visibility = 'visible';
    fireVisibilityChange();
    expect(result.current).toBe(true);
  });

  it('stays inactive when only one of the two conditions recovers', () => {
    visibility = 'hidden';
    focused = false;
    const { result } = renderHook(() => useIsDocumentActive());

    visibility = 'visible';
    fireVisibilityChange();

    expect(result.current).toBe(false);
  });

  it('removes its listeners on unmount', () => {
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener');
    const removeWindowListener = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useIsDocumentActive());
    unmount();

    expect(removeDocumentListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(removeWindowListener).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(removeWindowListener).toHaveBeenCalledWith('blur', expect.any(Function));
  });
});
