import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { VCProfileTabView } from '../VCProfileTabView';
import type { VcProfileFormValues } from '../VCProfileTabView.types';

const VALUES: VcProfileFormValues = {
  profileId: 'profile-1',
  displayName: 'Helper',
  tagline: '',
  description: '',
  keywords: { id: undefined, tags: [] },
  avatar: { id: '', uri: null, altText: null },
  references: [],
};

const renderView = (disabled: boolean) =>
  render(
    <I18nextProvider i18n={i18n}>
      <VCProfileTabView
        values={VALUES}
        loading={false}
        disabled={disabled}
        onChange={vi.fn()}
        onReferencesChange={vi.fn()}
        onUploadAvatar={vi.fn()}
        uploadingAvatar={false}
        footerSlot={<span>footer</span>}
      />
    </I18nextProvider>
  );

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces(['crd-contributorSettings']);
});

describe('VCProfileTabView', () => {
  // The save re-bases the whole buffer on the refetched values, so an edit typed mid-save would be lost.
  it('freezes the whole form while a Save runs', async () => {
    const { container } = renderView(true);
    const name = await screen.findByDisplayValue('Helper');
    expect(container.firstElementChild).toHaveAttribute('inert');
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    expect(name.closest('[inert]')).toBe(container.firstElementChild);
  });

  it('is editable otherwise', async () => {
    renderView(false);
    expect((await screen.findByDisplayValue('Helper')).closest('[inert]')).toBeNull();
  });
});
