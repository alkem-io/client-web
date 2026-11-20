import { render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import spaceSettingsEn from '@/crd/i18n/spaceSettings/spaceSettings.en.json';
import { SpaceSettingsAccountView, type SpaceSettingsAccountViewProps } from './SpaceSettingsAccountView';

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-spaceSettings': spaceSettingsEn } },
    interpolation: { escapeValue: false },
  });
});

const renderView = (overrides: Partial<SpaceSettingsAccountViewProps> = {}) =>
  render(
    <I18nextProvider i18n={i18n}>
      <SpaceSettingsAccountView
        url="https://alkem.io/space"
        plan={null}
        visibility="active"
        host={null}
        contactSupportHref="https://alkem.io/support"
        changeLicenseHref="https://alkem.io/support"
        canDeleteSpace={false}
        onDeleteSpace={vi.fn()}
        onCopyUrl={vi.fn()}
        {...overrides}
      />
    </I18nextProvider>
  );

describe('SpaceSettingsAccountView (spec 045 FR-024b)', () => {
  it('shows the translated visibility status, never the raw value', () => {
    renderView({ visibility: 'archived' });
    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.queryByText('ARCHIVED')).not.toBeInTheDocument();
  });

  it.each([
    ['organization', 'Organisation'],
    ['user', 'User'],
    ['virtualContributor', 'Virtual Contributor'],
  ] as const)('shows a %s host as "%s"', (type, label) => {
    renderView({ host: { displayName: 'Acme', avatarUrl: null, type } });
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('keeps the License section with "No active license" and Change License when there is no plan', () => {
    renderView({ plan: null });
    expect(screen.getByText('License')).toBeInTheDocument();
    expect(screen.getByText('No active license')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Change License/ })).toBeInTheDocument();
  });

  it('shows the plan name instead of the no-plan line when a plan is active', () => {
    renderView({ plan: { name: 'Plus', features: [], daysLeft: 5 } });
    expect(screen.getByText('Plus')).toBeInTheDocument();
    expect(screen.queryByText('No active license')).not.toBeInTheDocument();
    expect(screen.getByText('5 days remaining')).toBeInTheDocument();
  });
});
