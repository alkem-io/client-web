import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { CookieConsentBanner } from './CookieConsentBanner';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-layout');
});

const renderBanner = (overrides: Partial<ComponentProps<typeof CookieConsentBanner>> = {}) => {
  const props = { onAcceptAll: vi.fn(), onOnlyNecessary: vi.fn(), onOpenSettings: vi.fn(), ...overrides };
  render(
    <I18nextProvider i18n={i18n}>
      <CookieConsentBanner {...props} />
    </I18nextProvider>
  );
  return props;
};

describe('CookieConsentBanner', () => {
  it('is a region named Cookies', () => {
    renderBanner();
    expect(screen.getByRole('region', { name: 'Cookies' })).toBeInTheDocument();
  });

  it('gives both choices the same variant and size', () => {
    renderBanner();
    const acceptAll = screen.getByRole('button', { name: 'Accept all' });
    const onlyNecessary = screen.getByRole('button', { name: 'Only necessary' });
    expect(onlyNecessary.className).toBe(acceptAll.className);
    expect(acceptAll).toHaveClass('h-11', 'bg-primary');
  });

  it.each([
    ['Accept all', 'onAcceptAll'],
    ['Only necessary', 'onOnlyNecessary'],
    ['Settings', 'onOpenSettings'],
  ] as const)('"%s" calls %s', async (name, handler) => {
    const props = renderBanner();
    await userEvent.click(screen.getByRole('button', { name }));
    expect(props[handler]).toHaveBeenCalledTimes(1);
  });

  it('shows a save failure as an alert', () => {
    renderBanner({ error: 'Could not save' });
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
  });
});
