import { render, screen, within } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import contributorSettingsEn from '@/crd/i18n/contributorSettings/contributorSettings.en.json';
import { type OrgProfileFormValuesData, OrgProfileTabView } from './OrgProfileTabView';

// The brand icons are `*.svg?react` imports, which the test transform does not turn into components.
vi.mock('@/crd/components/contributor/settings/ProfileFormFields', async importOriginal => ({
  ...(await importOriginal<typeof import('@/crd/components/contributor/settings/ProfileFormFields')>()),
  SocialLinksFields: () => null,
}));

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-contributorSettings': contributorSettingsEn } },
    interpolation: { escapeValue: false },
  });
});

const values: OrgProfileFormValuesData = {
  profileId: 'p1',
  organizationId: 'o1',
  nameID: 'acme',
  displayName: 'Acme',
  tagline: '',
  description: '',
  city: '',
  country: '',
  keywords: { tags: [] },
  capabilities: { tags: [] },
  contactEmail: 'hello@acme.org',
  domain: 'acme.org',
  legalEntityName: 'Acme B.V.',
  website: '',
  avatar: { id: 'a1', uri: null, altText: null },
  references: [],
  recognizedReferences: { linkedin: null, bsky: null, github: null },
  verifiedStatus: 'notVerified',
};

const sectionOf = (title: string) => {
  // A collapsible SettingsSection: the heading's parent is the section root.
  const section = screen.getByRole('heading', { name: title }).parentElement;
  if (!section) throw new Error(`no section "${title}"`);
  return section;
};

describe('OrgProfileTabView — contact fields (spec 097 FR-091a)', () => {
  it('shows Contact Email in Social Links; Contact & Legal keeps domain and legal name', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <OrgProfileTabView
          values={values}
          countries={[]}
          loading={false}
          onChange={vi.fn()}
          onReferencesChange={vi.fn()}
          onUpdateRecognizedReference={vi.fn()}
          onUploadAvatar={vi.fn()}
          uploadingAvatar={false}
        />
      </I18nextProvider>
    );

    expect(within(sectionOf('Social Links')).getByDisplayValue('hello@acme.org')).toBeInTheDocument();
    const contactLegal = sectionOf('Contact & Legal');
    expect(within(contactLegal).queryByDisplayValue('hello@acme.org')).not.toBeInTheDocument();
    expect(within(contactLegal).getByDisplayValue('acme.org')).toBeInTheDocument();
    expect(within(contactLegal).getByDisplayValue('Acme B.V.')).toBeInTheDocument();
  });
});
