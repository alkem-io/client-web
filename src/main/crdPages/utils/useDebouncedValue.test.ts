import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

const DELAY = 300;
const isEmpty = (value: string) => value === '';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('applies a value only after the delay elapses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, DELAY), {
      initialProps: { value: '' },
    });

    rerender({ value: 'cli' });
    expect(result.current).toBe('');

    act(() => {
      vi.advanceTimersByTime(DELAY);
    });
    expect(result.current).toBe('cli');
  });

  test('a burst of changes inside the delay resolves to the last value only', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, DELAY), {
      initialProps: { value: '' },
    });

    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(DELAY / 2));
    rerender({ value: 'cl' });
    act(() => vi.advanceTimersByTime(DELAY / 2));
    rerender({ value: 'cli' });
    expect(result.current).toBe('');

    act(() => vi.advanceTimersByTime(DELAY));
    expect(result.current).toBe('cli');
  });

  test('an immediate value is applied synchronously, without waiting', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, DELAY, { immediate: isEmpty }), {
      initialProps: { value: 'climate' },
    });
    act(() => vi.advanceTimersByTime(DELAY));
    expect(result.current).toBe('climate');

    rerender({ value: '' });
    expect(result.current).toBe('');
  });

  test('retyping inside the delay right after a clear never resurfaces the cleared value', () => {
    // Regression: the field goes 'climate' -> '' -> 's' within one delay
    // window. The old hook only wrote on timer expiry and the '' timer was
    // cancelled by the 's' keystroke, so readers saw 'climate' again until
    // the 's' timer fired — re-issuing a search for the term just cleared.
    const seen: string[] = [];
    const { result, rerender } = renderHook(
      ({ value }) => {
        const debounced = useDebouncedValue(value, DELAY, { immediate: isEmpty });
        seen.push(debounced);
        return debounced;
      },
      { initialProps: { value: 'climate' } }
    );
    act(() => vi.advanceTimersByTime(DELAY));
    expect(result.current).toBe('climate');

    rerender({ value: '' });
    expect(result.current).toBe('');

    rerender({ value: 's' });
    act(() => vi.advanceTimersByTime(DELAY / 2));
    expect(result.current).toBe('');

    act(() => vi.advanceTimersByTime(DELAY / 2));
    expect(result.current).toBe('s');

    const afterClear = seen.slice(seen.indexOf(''));
    expect(afterClear).not.toContain('climate');
  });
});
