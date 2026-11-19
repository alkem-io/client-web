import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { cloneElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Radix portals the popover content out of the tree that opened it; the mock
// keeps trigger and content together so the scroll container can be inspected
// without a real portal.
const captured = vi.hoisted(() => ({
  contentProps: {} as Record<string, unknown>,
  pickerProps: {} as Record<string, unknown>,
  loadFails: false,
  onOpenChange: (_open: boolean) => {},
}));

vi.mock('@/crd/primitives/popover', () => ({
  Popover: ({ children, onOpenChange }: { children: React.ReactNode; onOpenChange: (open: boolean) => void }) => {
    captured.onOpenChange = onOpenChange;
    return <div>{children}</div>;
  },
  // Like Radix with `asChild`, the ref lands on the trigger element itself.
  PopoverTrigger: ({
    children,
    asChild: _asChild,
    onPointerEnter: _onPointerEnter,
    onFocus: _onFocus,
    ...props
  }: { children: React.ReactElement } & Record<string, unknown>) => cloneElement(children, props),
  PopoverContent: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => {
    captured.contentProps = props;
    return <div>{children}</div>;
  },
}));

// The real picker pulls in the full emoji dataset, which is irrelevant here —
// only the list element it renders matters.
vi.mock('emoji-picker-react', () => ({
  default: (props: Record<string, unknown>) => {
    if (captured.loadFails) throw new Error('Failed to fetch dynamically imported module');
    captured.pickerProps = props;
    return <div className="epr-body" data-testid="epr-body" />;
  },
}));

const { EmojiPicker } = await import('./EmojiPicker');

// The library is lazy-loaded, so the list appears only once its import resolves.
const renderPicker = async (mode?: 'reaction' | 'insert') => {
  const view = render(
    <EmojiPicker
      onSelect={vi.fn()}
      mode={mode}
      trigger={
        <button type="button" data-testid="trigger">
          open
        </button>
      }
    />
  );
  await screen.findByTestId('epr-body');
  return view;
};

const listeners: Array<[string, EventListener]> = [];
const spyOnDocument = (type: string) => {
  const seen = vi.fn();
  document.addEventListener(type, seen);
  listeners.push([type, seen]);
  return seen;
};

afterEach(() => {
  captured.loadFails = false;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  for (const [type, listener] of listeners.splice(0)) {
    document.removeEventListener(type, listener);
  }
});

describe('EmojiPicker scroll containment', () => {
  // A modal dialog's scroll lock cancels wheel/touchmove gestures it sees on
  // the document and does not recognise as its own. The portalled picker is
  // never recognised, so the gesture has to stop before the document for the
  // emoji list to scroll at all.
  it.each(['wheel', 'touchmove'])('keeps a %s gesture over the emoji list from reaching the document', async type => {
    const seen = spyOnDocument(type);
    await renderPicker();

    screen.getByTestId('epr-body').dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));

    expect(seen).not.toHaveBeenCalled();
  });

  it.each(['wheel', 'touchmove'])('still lets a %s gesture outside the picker reach the document', async type => {
    const seen = spyOnDocument(type);
    await renderPicker();

    screen.getByTestId('trigger').dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));

    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('contains overscroll so a gesture past either end of the list does not scroll what is behind it', async () => {
    await renderPicker();

    expect(screen.getByTestId('emoji-picker-scroll-container').className).toContain('[&_.epr-body]:overscroll-contain');
  });

  it('detaches its listeners when the picker unmounts', async () => {
    const seen = spyOnDocument('wheel');
    const { unmount } = await renderPicker();
    // The listener lives on the container, not on the list, so the container is
    // what has to survive the unmount: re-attaching the list alone would bubble
    // straight past the listener host and pass whether or not cleanup ran.
    const container = screen.getByTestId('emoji-picker-scroll-container');
    const list = screen.getByTestId('epr-body');
    unmount();

    // Detached nodes do not bubble to the document, so re-attach the container
    // with the list still inside it to prove the containment listener itself is
    // gone rather than the tree.
    document.body.appendChild(container);
    list.dispatchEvent(new Event('wheel', { bubbles: true, cancelable: true }));
    container.remove();

    expect(seen).toHaveBeenCalledTimes(1);
  });
});

// On a phone the picker's natural 350px width plus the popover sitting flush
// against the screen edge clipped it (seen at 412px wide); narrower phones
// would lose more. jsdom has no layout, so the props that prevent it are pinned.
describe('EmojiPicker on narrow screens', () => {
  it('keeps a margin from the screen edges when it has to shift', async () => {
    await renderPicker();
    expect(captured.contentProps.collisionPadding).toBe(8);
  });

  // Measured on a 360x640 phone: the 450px-tall picker ran 134px past the bottom
  // of the screen (and 69px past the top at 375x667) when neither side of the
  // trigger had room for it.
  it('never grows taller than the room the popover has on its side', async () => {
    await renderPicker();
    expect(captured.pickerProps.height).toBe(
      'min(450px, calc(var(--radix-popover-content-available-height, 450px) - 2px))'
    );
  });

  it('never grows wider than the screen minus that margin', async () => {
    await renderPicker();
    expect(captured.pickerProps.width).toBe('min(350px, calc(100vw - 16px))');
  });
});

// Radix moves focus into the popover when it opens, so on a phone the first
// focusable element inside the picker raised the on-screen keyboard.
describe('EmojiPicker focus on open', () => {
  const autoFocusEventAfter = async (open: (trigger: HTMLElement) => void) => {
    await renderPicker();
    open(screen.getByTestId('trigger'));
    const event = new Event('focus', { cancelable: true });
    (captured.contentProps.onOpenAutoFocus as (event: Event) => void)(event);
    return event;
  };

  it('keeps focus out of the picker when it is opened by a tap or click', async () => {
    const event = await autoFocusEventAfter(trigger => fireEvent.pointerDown(trigger));
    expect(event.defaultPrevented).toBe(true);
  });

  // Otherwise the next Tab leaves the portalled popover without reaching it.
  it('lets focus move into the picker when it is opened from the keyboard', async () => {
    const event = await autoFocusEventAfter(trigger => fireEvent.keyDown(trigger, { key: 'Enter' }));
    expect(event.defaultPrevented).toBe(false);
  });
});

// A reaction wants one of a handful of emojis, and the library builds its whole
// grid on every open, so reactions open on a short bar and load the library
// only when the full grid is asked for.
describe('EmojiPicker modes', () => {
  const renderReactionPicker = (onSelect = vi.fn()) =>
    render(<EmojiPicker onSelect={onSelect} mode="reaction" trigger={<button type="button">open</button>} />);

  it('opens on the quick bar without the library in reaction mode', () => {
    renderReactionPicker();

    expect(screen.getByRole('button', { name: '🚀' })).toBeTruthy();
    expect(screen.queryByTestId('epr-body')).toBeNull();
  });

  it('picks a quick reaction', () => {
    const onSelect = vi.fn();
    renderReactionPicker(onSelect);

    fireEvent.click(screen.getByRole('button', { name: '❤️' }));

    expect(onSelect).toHaveBeenCalledWith('❤️');
  });

  it('shows the full grid from the quick bar on request', async () => {
    renderReactionPicker();

    fireEvent.click(screen.getByRole('button', { name: 'emojiPicker.more' }));

    expect(await screen.findByTestId('epr-body')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '🚀' })).toBeNull();
  });

  it('fills the quick bar with the set offered for reacting to a post', () => {
    renderReactionPicker();

    expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual([
      'open',
      '❤️',
      '🤗',
      '👏',
      '💡',
      '🎯',
      '✅',
      '🚀',
      '',
    ]);
  });

  it('puts the emojis last picked from the full grid first', () => {
    window.localStorage.setItem('epr_suggested', JSON.stringify([{ unified: '1f44d' }, { unified: '2764-fe0f' }]));
    renderReactionPicker();

    expect(
      screen
        .getAllByRole('button')
        .slice(1, 8)
        .map(button => button.textContent)
    ).toEqual(['👍', '❤️', '🤗', '👏', '💡', '🎯', '✅']);
    window.localStorage.removeItem('epr_suggested');
  });

  it('opens on the full grid by default', async () => {
    await renderPicker();
    expect(screen.queryByRole('button', { name: '🚀' })).toBeNull();
  });
});

// A tab kept open across a deploy, or offline, cannot fetch the lazy chunk.
describe('EmojiPicker when the library fails to load', () => {
  it('empties the popover and reports the error instead of throwing to the page', async () => {
    captured.loadFails = true;
    const reportError = vi.fn();
    vi.stubGlobal('reportError', reportError);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<EmojiPicker onSelect={vi.fn()} trigger={<button type="button" data-testid="trigger" />} />);

    expect(screen.getByTestId('trigger')).toBeTruthy();
    expect(screen.queryByTestId('epr-body')).toBeNull();
    await waitFor(() => expect(reportError).toHaveBeenCalledTimes(1));
  });
});

// The picker never overflows (its height is capped to the room it has), so the
// popover never flips by itself. Near the top of a phone screen that left a
// sliver of a picker above the trigger.
describe('EmojiPicker side', () => {
  const openAt = (top: number) => {
    render(
      <EmojiPicker
        onSelect={vi.fn()}
        trigger={
          <button type="button" data-testid="side-trigger">
            open
          </button>
        }
      />
    );
    vi.spyOn(screen.getByTestId('side-trigger'), 'getBoundingClientRect').mockReturnValue({
      top,
      bottom: top + 28,
    } as DOMRect);
    act(() => captured.onOpenChange(true));
  };

  it('opens below a trigger near the top of the screen', () => {
    openAt(60);
    expect(captured.contentProps.side).toBe('bottom');
  });

  it('opens above a trigger with room for the full picker', () => {
    openAt(600);
    expect(captured.contentProps.side).toBe('top');
  });

  it('stays above when there is even less room below', () => {
    vi.stubGlobal('innerHeight', 400);
    openAt(300);
    expect(captured.contentProps.side).toBe('top');
    vi.unstubAllGlobals();
  });
});
