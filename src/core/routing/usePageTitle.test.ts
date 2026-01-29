import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { usePageTitle } from './usePageTitle';
import '@/core/i18n/config'; // PageTitle needs translations

describe('usePageTitle', () => {
  const originalTitle = document.title;

  beforeEach(() => {
    document.title = 'Initial Title';
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  describe('with default options', () => {
    it('sets title with default Alkemio suffix', () => {
      renderHook(() => usePageTitle('Test Page'));
      expect(document.title).toBe('Test Page | Alkemio');
    });

    it('sets just the suffix when title is undefined', () => {
      renderHook(() => usePageTitle(undefined));
      expect(document.title).toBe('Alkemio');
    });

    it('sets just the suffix when title is empty string', () => {
      renderHook(() => usePageTitle(''));
      expect(document.title).toBe('Alkemio');
    });

    it('handles space names correctly', () => {
      renderHook(() => usePageTitle('Climate Change Initiative'));
      expect(document.title).toBe('Climate Change Initiative | Alkemio');
    });

    it('handles translated static page titles', () => {
      renderHook(() => usePageTitle('Forum'));
      expect(document.title).toBe('Forum | Alkemio');
    });
  });

  describe('with skipSuffix option', () => {
    it('sets only the title when skipSuffix is true', () => {
      renderHook(() => usePageTitle('Alkemio', { skipSuffix: true }));
      expect(document.title).toBe('Alkemio');
    });

    it('falls back to suffix when title is undefined and skipSuffix is true', () => {
      renderHook(() => usePageTitle(undefined, { skipSuffix: true }));
      expect(document.title).toBe('Alkemio');
    });

    it('test skipSuffix', () => {
      renderHook(() => usePageTitle('Custom Brand', { skipSuffix: true }));
      expect(document.title).toBe('Custom Brand');
    });
  });

  describe('with custom suffix option', () => {
    it('uses custom suffix when provided', () => {
      renderHook(() => usePageTitle('Test Page', { suffix: 'Custom Suffix' }));
      expect(document.title).toBe('Test Page | Custom Suffix');
    });

    it('falls back to custom suffix when title is undefined', () => {
      renderHook(() => usePageTitle(undefined, { suffix: 'Custom Suffix' }));
      expect(document.title).toBe('Custom Suffix');
    });
  });

  describe('title updates on dependency changes', () => {
    it('updates title when title prop changes', () => {
      const { rerender } = renderHook(({ title }) => usePageTitle(title), {
        initialProps: { title: 'First Page' },
      });

      expect(document.title).toBe('First Page | Alkemio');

      rerender({ title: 'Second Page' });
      expect(document.title).toBe('Second Page | Alkemio');
    });

    it('updates title when options change', () => {
      type HookProps = { title: string; options: { suffix?: string; skipSuffix?: boolean } | undefined };
      const { rerender } = renderHook(({ title, options }: HookProps) => usePageTitle(title, options), {
        initialProps: { title: 'Test', options: undefined } as HookProps,
      });

      expect(document.title).toBe('Test | Alkemio');

      rerender({ title: 'Test', options: { skipSuffix: true } });
      expect(document.title).toBe('Test');
    });
  });

  describe('edge cases', () => {
    it('handles very long space names', () => {
      const longName = 'A'.repeat(100);
      renderHook(() => usePageTitle(longName));
      expect(document.title).toBe(`${longName} | Alkemio`);
    });

    it('handles special characters in title', () => {
      renderHook(() => usePageTitle('Test & Page <with> "special" chars'));
      expect(document.title).toBe('Test & Page <with> "special" chars | Alkemio');
    });

    it('handles unicode characters', () => {
      renderHook(() => usePageTitle('Ініціатива 🌍'));
      expect(document.title).toBe('Ініціатива 🌍 | Alkemio');
    });
  });
});
