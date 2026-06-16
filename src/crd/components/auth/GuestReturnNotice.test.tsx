import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { GuestReturnNotice } from './GuestReturnNotice';

// Mirror the other CRD auth tests: stub i18n so `t(key)` returns the key,
// letting us assert against the stable `guestReturn.*` keys.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('GuestReturnNotice', () => {
  test('[US1] renders title, description, both action buttons, and the contribute hint', () => {
    render(<GuestReturnNotice onBackToWhiteboard={vi.fn()} onGoToWebsite={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'guestReturn.title' })).toBeInTheDocument();
    expect(screen.getByText('guestReturn.description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'guestReturn.backButton' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'guestReturn.websiteButton' })).toBeInTheDocument();
    expect(screen.getByText('guestReturn.contributeTitle')).toBeInTheDocument();
    expect(screen.getByText('guestReturn.contributeDescription')).toBeInTheDocument();
  });

  test('[US1] decorative icons are hidden from assistive technology', () => {
    const { container } = render(<GuestReturnNotice onBackToWhiteboard={vi.fn()} onGoToWebsite={vi.fn()} />);
    // Both lucide icons (ArrowLeft, ArrowRight) must carry aria-hidden.
    const hiddenIcons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(hiddenIcons.length).toBe(2);
  });

  test('[US2] clicking "Back to whiteboard" calls onBackToWhiteboard once and not onGoToWebsite', async () => {
    const onBackToWhiteboard = vi.fn();
    const onGoToWebsite = vi.fn();
    render(<GuestReturnNotice onBackToWhiteboard={onBackToWhiteboard} onGoToWebsite={onGoToWebsite} />);

    await userEvent.click(screen.getByRole('button', { name: 'guestReturn.backButton' }));

    expect(onBackToWhiteboard).toHaveBeenCalledTimes(1);
    expect(onGoToWebsite).not.toHaveBeenCalled();
  });

  test('[US3] clicking "Go to our website" calls onGoToWebsite once and not onBackToWhiteboard', async () => {
    const onBackToWhiteboard = vi.fn();
    const onGoToWebsite = vi.fn();
    render(<GuestReturnNotice onBackToWhiteboard={onBackToWhiteboard} onGoToWebsite={onGoToWebsite} />);

    await userEvent.click(screen.getByRole('button', { name: 'guestReturn.websiteButton' }));

    expect(onGoToWebsite).toHaveBeenCalledTimes(1);
    expect(onBackToWhiteboard).not.toHaveBeenCalled();
  });
});
