import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleAppBack } from '@/core/appMode/appBack';
import { SearchOverlay } from './SearchOverlay';

const renderOverlay = (onClose = vi.fn()) => {
  render(
    <SearchOverlay
      isOpen={true}
      onClose={onClose}
      state="empty"
      tags={[]}
      inputValue=""
      onInputChange={() => {}}
      onTagAdd={() => {}}
      onTagRemove={() => {}}
      maxTags={5}
      categories={[]}
      disclaimer=""
      noResultsTerms=""
    />
  );
  return onClose;
};

const escapeOnBody = () => {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  act(() => {
    document.body.dispatchEvent(event);
  });
  return event;
};

/** Stands in for a Radix layer above the overlay: it handles the Escape first (document capture). */
const layerAboveClaimsEscape = () => {
  const claim = (e: KeyboardEvent) => e.preventDefault();
  document.addEventListener('keydown', claim, true);
  return () => document.removeEventListener('keydown', claim, true);
};

describe('SearchOverlay Escape', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('closes on Escape and claims it', () => {
    const onClose = renderOverlay();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const event = escapeOnBody();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('stays open on an Escape a higher layer already handled', () => {
    const onClose = renderOverlay();
    const release = layerAboveClaimsEscape();
    try {
      escapeOnBody();
    } finally {
      release();
    }
    expect(onClose).not.toHaveBeenCalled();
  });

  it('is closed by the app Back button, which reports it consumed the press', () => {
    const onClose = renderOverlay();
    let consumed = false;
    act(() => {
      consumed = handleAppBack();
    });
    expect(consumed).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
