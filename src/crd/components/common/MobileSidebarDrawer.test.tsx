import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { handleAppBack } from '@/core/appMode/appBack';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';
import { MobileSidebarDrawer } from './MobileSidebarDrawer';

const renderDrawer = (onClose = vi.fn(), children = <p>links</p>) => {
  render(
    <MobileSidebarDrawer open={true} onClose={onClose} title="Menu" closeLabel="Close menu">
      {children}
    </MobileSidebarDrawer>
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

const back = () => {
  let consumed = false;
  act(() => {
    consumed = handleAppBack();
  });
  return consumed;
};

const OpenDialog = () => {
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Details</DialogTitle>
      </DialogContent>
    </Dialog>
  );
};

describe('MobileSidebarDrawer Escape', () => {
  it('closes on Escape and claims it', () => {
    const onClose = renderDrawer();
    const event = escapeOnBody();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('stays open on an Escape a higher layer already handled', () => {
    const onClose = renderDrawer();
    const claim = (e: KeyboardEvent) => e.preventDefault();
    document.addEventListener('keydown', claim, true);
    try {
      escapeOnBody();
    } finally {
      document.removeEventListener('keydown', claim, true);
    }
    expect(onClose).not.toHaveBeenCalled();
  });

  it('is closed by the app Back button, which reports it consumed the press', () => {
    const onClose = renderDrawer();
    expect(back()).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('with a dialog open above it, one Back closes only the dialog and the next closes the drawer', () => {
    const onClose = renderDrawer(vi.fn(), <OpenDialog />);
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument();

    expect(back()).toBe(true);
    expect(screen.queryByRole('dialog', { name: 'Details' })).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    expect(back()).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
