import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setBaseTitle, setDialogTitle, setTitleOverride, setTitlePrefix } from './documentTitle';
import { useDialogTitle } from './useDialogTitle';
import '@/core/i18n/config';

describe('dialog title layer', () => {
  beforeEach(() => {
    setTitleOverride(null);
    setDialogTitle(null);
    setTitlePrefix('');
    setBaseTitle('Building the A-team | Alkemio');
  });

  afterEach(() => {
    setTitleOverride(null);
    setDialogTitle(null);
    setTitlePrefix('');
    setBaseTitle('');
  });

  it('shows the dialog title in place of the base and restores the base when cleared', () => {
    setDialogTitle('Mobile issues tracker | Alkemio');
    expect(document.title).toBe('Mobile issues tracker | Alkemio');

    setDialogTitle(null);
    expect(document.title).toBe('Building the A-team | Alkemio');
  });

  it('composes the unread prefix on top of the dialog title', () => {
    setTitlePrefix('(2) ');
    setDialogTitle('Mobile issues tracker | Alkemio');
    expect(document.title).toBe('(2) Mobile issues tracker | Alkemio');
  });

  it('lets the badge override win over the dialog title', () => {
    setTitlePrefix('(1) ');
    setDialogTitle('Mobile issues tracker | Alkemio');
    setTitleOverride('Ana is calling you');
    expect(document.title).toBe('(1) Ana is calling you');

    setTitleOverride(null);
    expect(document.title).toBe('(1) Mobile issues tracker | Alkemio');
  });

  it('keeps a base change made while the dialog is open and shows it on close', () => {
    setDialogTitle('Mobile issues tracker | Alkemio');
    setBaseTitle('Other space | Alkemio');
    expect(document.title).toBe('Mobile issues tracker | Alkemio');

    setDialogTitle(null);
    expect(document.title).toBe('Other space | Alkemio');
  });
});

describe('useDialogTitle', () => {
  beforeEach(() => {
    setTitleOverride(null);
    setDialogTitle(null);
    setTitlePrefix('');
    setBaseTitle('Building the A-team | Alkemio');
  });

  afterEach(() => {
    setDialogTitle(null);
    setTitlePrefix('');
    setBaseTitle('');
  });

  it('does not touch the tab while disabled', () => {
    renderHook(() => useDialogTitle('Mobile issues tracker', false));
    expect(document.title).toBe('Building the A-team | Alkemio');
  });

  it('shows the composed title while enabled and restores the page title when disabled', () => {
    const { rerender } = renderHook(({ enabled }) => useDialogTitle('Mobile issues tracker', enabled), {
      initialProps: { enabled: true },
    });
    expect(document.title).toBe('Mobile issues tracker | Alkemio');

    rerender({ enabled: false });
    expect(document.title).toBe('Building the A-team | Alkemio');
  });

  it('restores the page title on unmount', () => {
    const { unmount } = renderHook(() => useDialogTitle('Mobile issues tracker', true));
    expect(document.title).toBe('Mobile issues tracker | Alkemio');

    unmount();
    expect(document.title).toBe('Building the A-team | Alkemio');
  });

  it('follows a title change while enabled', () => {
    const { rerender } = renderHook(({ title }) => useDialogTitle(title, true), {
      initialProps: { title: 'Mobile issues tracker' },
    });
    rerender({ title: 'Mobile bugs' });
    expect(document.title).toBe('Mobile bugs | Alkemio');
  });
});
