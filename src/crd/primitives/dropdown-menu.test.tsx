import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';

function UncontrolledMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>My profile</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// jsdom has no PointerEvent, so fireEvent.pointerDown would drop `pointerType` and `button`.
if (typeof window.PointerEvent === 'undefined') {
  class PointerEventStub extends MouseEvent {
    pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? '';
    }
  }
  window.PointerEvent = PointerEventStub as unknown as typeof PointerEvent;
}

const trigger = () => screen.getByRole('button', { name: 'Open menu' });
const menuItem = () => screen.queryByRole('menuitem', { name: 'My profile' });

/**
 * iOS Safari does not always deliver `pointerdown` for a tap — on a scrolled page,
 * taps on the header's menus arrived as a bare `click` and the menus never opened.
 * Touch and pen therefore open on click; mouse keeps opening on press.
 */
describe('DropdownMenuTrigger', () => {
  test('a tap that reaches the page as a click alone opens the menu', () => {
    render(<UncontrolledMenu />);

    fireEvent.click(trigger());

    expect(menuItem()).toBeInTheDocument();
  });

  test('a touch press opens on finger lift, not on finger down', () => {
    render(<UncontrolledMenu />);

    fireEvent.pointerDown(trigger(), { pointerType: 'touch', button: 0 });
    // A touch that turns into a scroll ends here (pointercancel, no click).
    expect(menuItem()).not.toBeInTheDocument();

    fireEvent.click(trigger());
    expect(menuItem()).toBeInTheDocument();
  });

  test('a mouse press still opens on pointerdown and its click does not close it again', () => {
    render(<UncontrolledMenu />);
    // Captured up front: once open, the modal menu hides the trigger from the accessibility tree.
    const button = trigger();

    fireEvent.pointerDown(button, { pointerType: 'mouse', button: 0 });
    expect(menuItem()).toBeInTheDocument();

    fireEvent.click(button);
    expect(menuItem()).toBeInTheDocument();
  });

  test('a mouse open whose click never reaches the trigger does not swallow the next tap', () => {
    render(<UncontrolledMenu />);
    const button = trigger();

    // The modal menu sets pointer-events: none on <body>, so the click that ends a
    // mouse press lands outside the trigger and the trigger never sees it.
    fireEvent.pointerDown(button, { pointerType: 'mouse', button: 0 });
    expect(menuItem()).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(menuItem()).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(menuItem()).toBeInTheDocument();
  });

  test('on a non-modal menu, a mouse press that closes it is not undone by its click', () => {
    render(
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>My profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    const button = trigger();

    fireEvent.pointerDown(button, { pointerType: 'mouse', button: 0 });
    fireEvent.click(button);
    expect(menuItem()).toBeInTheDocument();

    fireEvent.pointerDown(button, { pointerType: 'mouse', button: 0 });
    fireEvent.click(button);
    expect(menuItem()).not.toBeInTheDocument();
  });

  test('a controlled menu is opened through its onOpenChange', () => {
    const onOpenChange = vi.fn();
    function ControlledMenu() {
      const [open, setOpen] = useState(false);
      return (
        <DropdownMenu
          open={open}
          onOpenChange={next => {
            onOpenChange(next);
            setOpen(next);
          }}
        >
          <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>My profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    render(<ControlledMenu />);

    fireEvent.pointerDown(trigger(), { pointerType: 'touch', button: 0 });
    fireEvent.click(trigger());

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(menuItem()).toBeInTheDocument();
  });
});
