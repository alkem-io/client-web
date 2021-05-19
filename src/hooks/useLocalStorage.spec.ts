import { renderHook, act } from '@testing-library/react-hooks';
import { useLocalStorage } from './useLocalStorage';

const TEST_KEY = 'testKey';

afterEach(() => {
  window.localStorage.removeItem(TEST_KEY);
});

describe('useLocalStorage tests', () => {
  test('initialize with undefined', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY));
    expect(result.current[0]).toBe(undefined);
  });

  test('initialize with string', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'testValue'));
    expect(result.current[0]).toBe('testValue');
  });

  test('initialize with object', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, { name: 'testValue' }));
    expect(result.current[0]).toEqual({ name: 'testValue' });
  });

  test('changing value', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'testValue'));

    act(() => {
      result.current[1]('NewValue');
    });

    expect(result.current[0]).toBe('NewValue');
  });

  test.skip('event handler', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'testValue'));

    act(() => {
      window.localStorage.setItem(TEST_KEY, '');
    });
    expect(result.current[0]).toBe('NewValue');
  });
});
