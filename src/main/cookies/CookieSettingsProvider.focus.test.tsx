import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { CookieSettingsProvider, useCookieSettings } from './CookieSettingsProvider';

vi.mock('@/core/analytics/apm/context', () => ({ useApm: () => undefined }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/platform/config/useConfig', () => ({ useConfig: () => ({ locations: undefined }) }));
vi.mock('./useAlkemioCookies', () => ({
  useAlkemioCookies: () => ({ consent: { decided: true, analysis: false }, saveConsent: () => true }),
}));

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-layout');
});

const Opener = () => {
  const { openCookieSettings } = useCookieSettings();
  return (
    <button type="button" onClick={openCookieSettings}>
      footer entry
    </button>
  );
};

describe('CookieSettingsProvider focus', () => {
  it('returns focus to the control that opened the sheet when it closes', async () => {
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <CookieSettingsProvider>
          <Opener />
        </CookieSettingsProvider>
      </I18nextProvider>
    );
    const opener = screen.getByRole('button', { name: 'footer entry' });

    await user.click(opener);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
