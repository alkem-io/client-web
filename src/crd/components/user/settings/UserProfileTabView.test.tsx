import { render, screen, within } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import contributorSettingsEn from '@/crd/i18n/contributorSettings/contributorSettings.en.json';
import { UserProfileTabView } from './UserProfileTabView';
import type { UserProfileFormValues } from './UserProfileTabView.types';

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

const values: UserProfileFormValues = {
  profileId: 'p1',
  displayName: 'Ada',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+31 6 12345678',
  tagline: '',
  city: '',
  country: '',
  bio: '',
  skills: { tags: [] },
  keywords: { tags: [] },
  avatar: { id: 'a1', uri: null, altText: null },
  references: [],
  recognizedReferences: { linkedin: null, bsky: null, github: null },
};

const sectionOf = (title: string) => {
  // A collapsible SettingsSection: the heading's parent is the section root.
  const section = screen.getByRole('heading', { name: title }).parentElement;
  if (!section) throw new Error(`no section "${title}"`);
  return section;
};

describe('UserProfileTabView — contact fields (spec 097 FR-021a)', () => {
  it('shows Phone in Social Links and keeps the read-only Email in Identity', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <UserProfileTabView
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

    expect(within(sectionOf('Social Links')).getByDisplayValue('+31 6 12345678')).toBeInTheDocument();
    expect(within(sectionOf('Identity')).queryByDisplayValue('+31 6 12345678')).not.toBeInTheDocument();
    expect(within(sectionOf('Identity')).getByDisplayValue('ada@example.com')).toHaveAttribute('readonly');
  });
});
