import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleAppBack } from '@/core/appMode/appBack';
import { SearchOverlay } from './SearchOverlay';
import type { SearchScopeData } from './SearchTagInput';

const screenSize = { isSmallScreen: false, isMediumScreen: false, isLargeScreen: true };
vi.mock('@/crd/hooks/useMediaQuery', () => ({ useScreenSize: () => screenSize }));

const renderOverlay = (onClose = vi.fn(), scope?: SearchScopeData) => {
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
      scope={scope}
      onScopeChange={() => {}}
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

describe('SearchOverlay — full screen on a small screen', () => {
  afterEach(() => {
    screenSize.isSmallScreen = false;
  });

  const icon = (name: string) => screen.getByRole('dialog').querySelector(`.lucide-${name}`);

  it('drops the card edges and closes from a back arrow in place of the close button', () => {
    screenSize.isSmallScreen = true;
    const onClose = renderOverlay();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('rounded-none');
    expect(dialog).not.toHaveClass('border', 'rounded-xl');
    expect(icon('x')).toBeNull();

    fireEvent.click(icon('chevron-left')?.closest('button') as HTMLButtonElement);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps the input usable by wrapping the scope chip to its own line', () => {
    screenSize.isSmallScreen = true;
    renderOverlay(vi.fn(), { currentSpaceName: 'Space A', activeScope: 'Space A' });

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('min-w-40');
    const row = input.parentElement as HTMLElement;
    expect(row).toHaveClass('flex-wrap');
    expect(row.querySelector('button[aria-haspopup="menu"]')).toHaveClass('max-w-full');
  });

  it('stays a card with its close button above a small screen', () => {
    renderOverlay();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('border', 'rounded-xl');
    expect(icon('x')).not.toBeNull();
    expect(icon('chevron-left')).toBeNull();
    expect(screen.getByRole('textbox').parentElement).not.toHaveClass('flex-wrap');
  });
});
