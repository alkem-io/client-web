import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { CookieSettingsSheet } from './CookieSettingsSheet';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-layout');
});

type Props = ComponentProps<typeof CookieSettingsSheet>;

const renderSheet = (overrides: Partial<Props> = {}) => {
  const props: Props = {
    open: true,
    onOpenChange: vi.fn(),
    initialAnalysis: false,
    onSave: vi.fn(),
    cookiePolicyHref: 'https://example.org/cookies',
    privacyPolicyHref: 'https://example.org/privacy',
    ...overrides,
  };
  const view = render(
    <I18nextProvider i18n={i18n}>
      <CookieSettingsSheet {...props} />
    </I18nextProvider>
  );
  const rerender = (next: Partial<Props>) =>
    view.rerender(
      <I18nextProvider i18n={i18n}>
        <CookieSettingsSheet {...props} {...next} />
      </I18nextProvider>
    );
  return { props, rerender };
};

describe('CookieSettingsSheet', () => {
  it('shows Necessary switched on and disabled, with "Always on"', () => {
    renderSheet();
    const necessary = screen.getByRole('switch', { name: 'Necessary' });
    expect(necessary).toBeDisabled();
    expect(necessary).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Always on')).toBeInTheDocument();
  });

  it.each([false, true])('starts Analytics at initialAnalysis = %s', initialAnalysis => {
    renderSheet({ initialAnalysis });
    expect(screen.getByRole('switch', { name: 'Analytics' })).toHaveAttribute('aria-checked', String(initialAnalysis));
  });

  it('links to both policies in a new tab', () => {
    renderSheet();
    expect(screen.getByRole('link', { name: /Cookie policy/ })).toHaveAttribute('href', 'https://example.org/cookies');
    expect(screen.getByRole('link', { name: /Privacy policy/ })).toHaveAttribute('target', '_blank');
  });

  it('saves the switch value', async () => {
    const { props } = renderSheet();
    await userEvent.click(screen.getByRole('switch', { name: 'Analytics' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save settings' }));
    expect(props.onSave).toHaveBeenCalledWith(true);
  });

  it('closing does not save', async () => {
    const { props } = renderSheet();
    await userEvent.click(screen.getByRole('switch', { name: 'Analytics' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
    expect(props.onSave).not.toHaveBeenCalled();
  });

  it('discards the unsaved switch state when it opens again', async () => {
    const { rerender } = renderSheet();
    await userEvent.click(screen.getByRole('switch', { name: 'Analytics' }));
    rerender({ open: false });
    rerender({ open: true });
    expect(screen.getByRole('switch', { name: 'Analytics' })).toHaveAttribute('aria-checked', 'false');
  });

  it('shows a save failure as an alert', () => {
    renderSheet({ error: 'Could not save' });
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
  });
});
