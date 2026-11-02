import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { handleAppBack } from '@/core/appMode/appBack';
import { DashboardLayout } from './DashboardLayout';

const openDrawer = () => {
  render(
    <DashboardLayout sidebar={<a href="/home">Home</a>}>
      <p>content</p>
    </DashboardLayout>
  );
  fireEvent.click(screen.getByRole('button', { name: 'sidebar.openMenu' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
};

const escapeOnBody = () => {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  act(() => {
    document.body.dispatchEvent(event);
  });
  return event;
};

describe('DashboardLayout mobile drawer Escape', () => {
  it('closes the drawer on Escape and claims it', async () => {
    openDrawer();

    const event = escapeOnBody();

    expect(event.defaultPrevented).toBe(true);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('stays open on an Escape a higher layer already handled', async () => {
    openDrawer();
    const claim = (e: KeyboardEvent) => e.preventDefault();
    document.addEventListener('keydown', claim, true);
    try {
      escapeOnBody();
    } finally {
      document.removeEventListener('keydown', claim, true);
    }
    // The close unmounts after its exit animation; give it the time it would need.
    await new Promise(resolve => setTimeout(resolve, 250));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('is closed by the app Back button, which reports it consumed the press', async () => {
    openDrawer();
    let consumed = false;
    act(() => {
      consumed = handleAppBack();
    });
    expect(consumed).toBe(true);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
