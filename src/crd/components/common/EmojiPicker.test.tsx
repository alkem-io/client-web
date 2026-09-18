import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Radix portals the popover content out of the tree that opened it; the mock
// keeps trigger and content together so the scroll container can be inspected
// without a real portal.
vi.mock('@/crd/primitives/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children, asChild: _asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div>{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// The real picker pulls in the full emoji dataset, which is irrelevant here —
// only the list element it renders matters.
vi.mock('emoji-picker-react', () => ({
  default: () => <div className="epr-body" data-testid="epr-body" />,
  EmojiStyle: { NATIVE: 'native' },
}));

const { EmojiPicker } = await import('./EmojiPicker');

const renderPicker = () =>
  render(
    <EmojiPicker
      onSelect={vi.fn()}
      trigger={
        <button type="button" data-testid="trigger">
          open
        </button>
      }
    />
  );

const listeners: Array<[string, EventListener]> = [];
const spyOnDocument = (type: string) => {
  const seen = vi.fn();
  document.addEventListener(type, seen);
  listeners.push([type, seen]);
  return seen;
};

afterEach(() => {
  for (const [type, listener] of listeners.splice(0)) {
    document.removeEventListener(type, listener);
  }
});

describe('EmojiPicker scroll containment', () => {
  // A modal dialog's scroll lock cancels wheel/touchmove gestures it sees on
  // the document and does not recognise as its own. The portalled picker is
  // never recognised, so the gesture has to stop before the document for the
  // emoji list to scroll at all.
  it.each(['wheel', 'touchmove'])('keeps a %s gesture over the emoji list from reaching the document', type => {
    const seen = spyOnDocument(type);
    renderPicker();

    screen.getByTestId('epr-body').dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));

    expect(seen).not.toHaveBeenCalled();
  });

  it.each(['wheel', 'touchmove'])('still lets a %s gesture outside the picker reach the document', type => {
    const seen = spyOnDocument(type);
    renderPicker();

    screen.getByTestId('trigger').dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));

    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('contains overscroll so a gesture past either end of the list does not scroll what is behind it', () => {
    renderPicker();

    expect(screen.getByTestId('emoji-picker-scroll-container').className).toContain('[&_.epr-body]:overscroll-contain');
  });

  it('detaches its listeners when the picker unmounts', () => {
    const seen = spyOnDocument('wheel');
    const { unmount } = renderPicker();
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
