import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { claimDialogTitle, setBaseTitle, setTitleOverride, setTitlePrefix } from './documentTitle';
import { useDialogTitle } from './useDialogTitle';
import '@/core/i18n/config';

describe('dialog title layer', () => {
  const releases: Array<() => void> = [];
  const claim = (text: string) => {
    const release = claimDialogTitle(text);
    releases.push(release);
    return release;
  };

  beforeEach(() => {
    setTitleOverride(null);
    setTitlePrefix('');
    setBaseTitle('Building the A-team | Alkemio');
  });

  afterEach(() => {
    while (releases.length) releases.pop()?.();
    setTitleOverride(null);
    setTitlePrefix('');
    setBaseTitle('');
  });

  it('shows the dialog title in place of the base and restores the base when released', () => {
    const release = claim('Mobile issues tracker | Alkemio');
    expect(document.title).toBe('Mobile issues tracker | Alkemio');

    release();
    expect(document.title).toBe('Building the A-team | Alkemio');
  });

  it('composes the unread prefix on top of the dialog title', () => {
    setTitlePrefix('(2) ');
    claim('Mobile issues tracker | Alkemio');
    expect(document.title).toBe('(2) Mobile issues tracker | Alkemio');
  });

  it('lets the badge override win over the dialog title', () => {
    setTitlePrefix('(1) ');
    claim('Mobile issues tracker | Alkemio');
    setTitleOverride('Ana is calling you');
    expect(document.title).toBe('(1) Ana is calling you');

    setTitleOverride(null);
    expect(document.title).toBe('(1) Mobile issues tracker | Alkemio');
  });

  it('keeps a base change made while the dialog is open and shows it on release', () => {
    const release = claim('Mobile issues tracker | Alkemio');
    setBaseTitle('Other space | Alkemio');
    expect(document.title).toBe('Mobile issues tracker | Alkemio');

    release();
    expect(document.title).toBe('Other space | Alkemio');
  });

  it('keeps the board title when the task dialog on top of it closes', () => {
    const releaseBoard = claim('Sprint board | Alkemio');
    const releaseTask = claim('Sprint board | Alkemio');

    releaseTask();
    expect(document.title).toBe('Sprint board | Alkemio');

    releaseBoard();
    expect(document.title).toBe('Building the A-team | Alkemio');
  });

  it('shows the remaining claim when the lower one is released first', () => {
    const releaseLower = claim('Lower | Alkemio');
    const releaseUpper = claim('Upper | Alkemio');

    releaseLower();
    expect(document.title).toBe('Upper | Alkemio');

    releaseUpper();
    releaseUpper();
    expect(document.title).toBe('Building the A-team | Alkemio');
  });
});

describe('useDialogTitle', () => {
  beforeEach(() => {
    setTitleOverride(null);
    setTitlePrefix('');
    setBaseTitle('Building the A-team | Alkemio');
  });

  afterEach(() => {
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
