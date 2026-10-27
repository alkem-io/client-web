import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsSection } from './SettingsSection';

const renderSection = () =>
  render(
    <SettingsSection id="description" title="Description" defaultOpen={false}>
      <p id="why">Why body</p>
    </SettingsSection>
  );

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('SettingsSection — deep links', () => {
  it('stays collapsed when the URL hash targets something else', () => {
    window.history.replaceState(null, '', '/settings/about#references');
    renderSection();
    expect(screen.getByRole('button', { name: 'Description' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens when the URL hash targets the section itself', () => {
    window.history.replaceState(null, '', '/settings/about#description');
    renderSection();
    expect(screen.getByRole('button', { name: 'Description' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens and scrolls to an anchor inside the section', async () => {
    window.history.replaceState(null, '', '/settings/about#why');
    renderSection();
    expect(screen.getByRole('button', { name: 'Description' })).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(screen.getByText('Why body').scrollIntoView).toHaveBeenCalled());
  });
});
