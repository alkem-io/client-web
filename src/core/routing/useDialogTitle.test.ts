import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { claimDialogTitle, setBaseTitle, setTitleOverride, setTitlePrefix } from './documentTitle';
import { shortenTitlePart, useDialogTitle } from './useDialogTitle';
import { usePageTitle } from './usePageTitle';
import '@/core/i18n/config';

const PAGE_TITLE = 'Building the A-team | Alkemio';
const PAGE_NAME = 'Building the A-team';

describe('dialog title layer', () => {
  const releases: Array<() => void> = [];
  const claim = (text: string) => {
    const { release } = claimDialogTitle(() => text);
    releases.push(release);
    return release;
  };

  beforeEach(() => {
    setTitleOverride(null);
    setTitlePrefix('');
    setBaseTitle(PAGE_TITLE, PAGE_NAME);
  });

  afterEach(() => {
    while (releases.length) releases.pop()?.();
    setTitleOverride(null);
    setTitlePrefix('');
    setBaseTitle('');
  });

  it('shows the dialog title in place of the base and restores the base when released', () => {
    const release = claim('Retro | Team | Alkemio');
    expect(document.title).toBe('Retro | Team | Alkemio');

    release();
    expect(document.title).toBe(PAGE_TITLE);
  });

  it('hands the page name to the dialog and rebuilds when the page changes', () => {
    const { release } = claimDialogTitle(pageName => `Retro / ${pageName}`);
    releases.push(release);
    expect(document.title).toBe(`Retro / ${PAGE_NAME}`);

    setBaseTitle('Other space | Alkemio', 'Other space');
    expect(document.title).toBe('Retro / Other space');

    release();
    expect(document.title).toBe('Other space | Alkemio');
  });

  it('composes the unread prefix on top of the dialog title', () => {
    setTitlePrefix('(2) ');
    claim('Retro | Team | Alkemio');
    expect(document.title).toBe('(2) Retro | Team | Alkemio');
  });

  it('lets the badge override win over the dialog title', () => {
    setTitlePrefix('(1) ');
    claim('Retro | Team | Alkemio');
    setTitleOverride('Ana is calling you');
    expect(document.title).toBe('(1) Ana is calling you');

    setTitleOverride(null);
    expect(document.title).toBe('(1) Retro | Team | Alkemio');
  });

  it('keeps the board title when the task dialog on top of it closes', () => {
    const releaseBoard = claim('Board | Alkemio');
    const releaseTask = claim('Board | Alkemio');

    releaseTask();
    expect(document.title).toBe('Board | Alkemio');

    releaseBoard();
    expect(document.title).toBe(PAGE_TITLE);
  });

  it('shows the remaining claim when the lower one is released first', () => {
    const releaseLower = claim('Lower | Alkemio');
    const releaseUpper = claim('Upper | Alkemio');

    releaseLower();
    expect(document.title).toBe('Upper | Alkemio');

    releaseUpper();
    releaseUpper();
    expect(document.title).toBe(PAGE_TITLE);
  });
});

describe('shortenTitlePart', () => {
  it('keeps parts of up to 11 characters as they are', () => {
    expect(shortenTitlePart('Retro')).toBe('Retro');
    expect(shortenTitlePart('Sprint boar')).toBe('Sprint boar');
  });

  it('cuts longer parts to 10 characters plus an ellipsis', () => {
    expect(shortenTitlePart('Sprint board')).toBe('Sprint boa…');
    expect(shortenTitlePart('Mobile issues tracker')).toBe('Mobile iss…');
  });

  it('drops a space left before the ellipsis', () => {
    expect(shortenTitlePart('Interview notes')).toBe('Interview…');
  });

  it('never splits an emoji', () => {
    expect(shortenTitlePart('🌍'.repeat(12))).toBe(`${'🌍'.repeat(10)}…`);
  });
});

describe('useDialogTitle', () => {
  beforeEach(() => {
    setTitleOverride(null);
    setTitlePrefix('');
    setBaseTitle(PAGE_TITLE, PAGE_NAME);
  });

  afterEach(() => {
    setTitlePrefix('');
    setBaseTitle('');
  });

  it('does not touch the tab while disabled', () => {
    renderHook(() => useDialogTitle('Mobile issues tracker', false));
    expect(document.title).toBe(PAGE_TITLE);
  });

  it('shows "<title> | <page name> | Alkemio" while enabled and the page title when disabled', () => {
    const { rerender } = renderHook(({ enabled }) => useDialogTitle('Retro', enabled), {
      initialProps: { enabled: true },
    });
    expect(document.title).toBe('Retro | Building t… | Alkemio');

    rerender({ enabled: false });
    expect(document.title).toBe(PAGE_TITLE);
  });

  it('shortens both the title and the page name, never "Alkemio"', () => {
    renderHook(() => useDialogTitle('Mobile issues tracker', true));
    expect(document.title).toBe('Mobile iss… | Building t… | Alkemio');
  });

  it('leaves the page name out on a page without one', () => {
    setBaseTitle('Alkemio');
    renderHook(() => useDialogTitle('Retro', true));
    expect(document.title).toBe('Retro | Alkemio');
  });

  it('restores the page title on unmount', () => {
    const { unmount } = renderHook(() => useDialogTitle('Retro', true));
    expect(document.title).toBe('Retro | Building t… | Alkemio');

    unmount();
    expect(document.title).toBe(PAGE_TITLE);
  });

  it('keeps a renamed board beneath the task open on top of it', () => {
    const { rerender, unmount } = renderHook(
      ({ boardTitle, taskOpen }) => {
        useDialogTitle(boardTitle, true);
        useDialogTitle('Fix login', taskOpen);
      },
      { initialProps: { boardTitle: 'Sprint 1', taskOpen: true } }
    );
    expect(document.title).toBe('Fix login | Building t… | Alkemio');

    rerender({ boardTitle: 'Sprint 2', taskOpen: true });
    expect(document.title).toBe('Fix login | Building t… | Alkemio');

    rerender({ boardTitle: 'Sprint 2', taskOpen: false });
    expect(document.title).toBe('Sprint 2 | Building t… | Alkemio');
    unmount();
  });

  it('follows a title change while enabled', () => {
    const { rerender } = renderHook(({ title }) => useDialogTitle(title, true), {
      initialProps: { title: 'Retro' },
    });
    rerender({ title: 'Mobile bugs' });
    expect(document.title).toBe('Mobile bugs | Building t… | Alkemio');
  });
});

describe('usePageTitle hands its name to an open dialog', () => {
  afterEach(() => {
    setBaseTitle('');
  });

  it('uses the page title as the page name', () => {
    renderHook(() => {
      usePageTitle('Mobile app');
      useDialogTitle('Beta tester feedback', true);
    });
    expect(document.title).toBe('Beta teste… | Mobile app | Alkemio');
  });

  it('gives no page name on a page shown without a suffix', () => {
    renderHook(() => {
      usePageTitle('Alkemio', { skipSuffix: true });
      useDialogTitle('Retro', true);
    });
    expect(document.title).toBe('Retro | Alkemio');
  });
});
