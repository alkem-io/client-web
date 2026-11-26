import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test } from 'vitest';
import { PlatformOriginContext } from './PlatformOriginContext';
import usePlatformOrigin from './usePlatformOrigin';

describe('usePlatformOrigin', () => {
  test('a supplied origin wins over the legacy platform configuration', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <PlatformOriginContext value="https://alkem.io">{children}</PlatformOriginContext>
    );
    const { result } = renderHook(() => usePlatformOrigin(), { wrapper });

    expect(result.current).toBe('https://alkem.io');
  });
});
