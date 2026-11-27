import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { CookieSettingsSection } from './CookieSettingsSection';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-layout');
});

const renderSection = (overrides: Partial<ComponentProps<typeof CookieSettingsSection>> = {}) => {
  const onAnalysisChange = vi.fn();
  render(
    <I18nextProvider i18n={i18n}>
      <CookieSettingsSection
        analysis={false}
        onAnalysisChange={onAnalysisChange}
        cookiePolicyHref="https://example.org/cookies"
        privacyPolicyHref="https://example.org/privacy"
        {...overrides}
      />
    </I18nextProvider>
  );
  return { onAnalysisChange };
};

describe('CookieSettingsSection', () => {
  it('shows the section heading and keeps Necessary on and disabled', () => {
    renderSection();

    expect(screen.getByText('Cookie settings')).toBeInTheDocument();
    expect(screen.getByText('What Alkemio may store and measure on this device.')).toBeInTheDocument();
    const necessary = screen.getByRole('switch', { name: 'Necessary' });
    expect(necessary).toBeChecked();
    expect(necessary).toBeDisabled();
  });

  it('shows the stored Analytics choice', () => {
    renderSection({ analysis: true });

    expect(screen.getByRole('switch', { name: 'Analytics' })).toBeChecked();
  });

  it('reports an Analytics toggle straight away, without a save button', async () => {
    const { onAnalysisChange } = renderSection();

    await userEvent.click(screen.getByRole('switch', { name: 'Analytics' }));

    expect(onAnalysisChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('button', { name: 'Save settings' })).not.toBeInTheDocument();
  });

  it('shows a failed save as an alert', () => {
    renderSection({ error: 'Not saved' });

    expect(screen.getByRole('alert')).toHaveTextContent('Not saved');
  });
});
