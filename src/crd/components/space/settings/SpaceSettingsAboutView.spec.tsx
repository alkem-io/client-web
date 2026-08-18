/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import type { ClassificationEntryData } from '@/crd/components/classification/types';
import { render, screen } from '@/main/test/testUtils';
import { SpaceSettingsAboutView, type SpaceSettingsAboutViewProps } from './SpaceSettingsAboutView';

// MarkdownEditor pulls in Tiptap (heavy + flaky in jsdom, see LayoutPoolColumn.test.tsx) —
// nothing under test here touches the What/Why/Who editors, so stub it out.
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: () => null,
}));

beforeAll(async () => {
  await i18n.changeLanguage('en');
  // 'crd-common' is pulled in by the nested ReferencesEditor (crd-common:visibility.*
  // etc.) — load it alongside crd-spaceSettings so the first render doesn't hit an
  // unloaded-namespace Suspense fetch (which briefly renders nothing before findBy
  // catches up).
  await i18n.loadNamespaces(['crd-spaceSettings', 'crd-common']);
});

const ENTRY: ClassificationEntryData = {
  id: 'entry-1',
  displayLabel: 'SDGs',
  cardinality: 'MULTI_SELECT',
  values: [
    { id: 'sdg-13', label: '13 · Climate Action' },
    { id: 'sdg-14', label: '14 · Life Below Water' },
  ],
  selectedValueIDs: ['sdg-13'],
  display: true,
  sortOrder: 0,
};

const baseProps = (overrides?: Partial<SpaceSettingsAboutViewProps>): SpaceSettingsAboutViewProps => ({
  level: 'L0',
  name: 'My Space',
  tagline: 'A great space',
  country: '',
  city: '',
  avatar: { id: 'avatar', uri: null, altText: null },
  pageBanner: { id: 'pageBanner', uri: null, altText: null },
  cardBanner: { id: 'cardBanner', uri: null, altText: null },
  tagsetId: 'tagset-1',
  tags: [],
  profileId: 'profile-1',
  references: [],
  what: '',
  why: '',
  who: '',
  previewCard: {
    name: 'My Space',
    tagline: 'A great space',
    bannerUrl: null,
    avatarUrl: null,
    tags: [],
    color: '#000000',
    initials: 'MS',
    href: '/space/my-space',
  },
  countries: [],
  dirtyByField: {},
  saveStatusByField: {},
  onChange: vi.fn(),
  onUploadAvatar: vi.fn(),
  onUploadPageBanner: vi.fn(),
  onUploadCardBanner: vi.fn(),
  onReferencesChange: vi.fn(),
  onSaveSection: vi.fn(),
  classifications: [ENTRY],
  classificationSelectionPendingIds: [],
  onAddClassification: vi.fn(),
  onSelectClassificationValues: vi.fn(),
  onToggleClassificationDisplay: vi.fn(),
  onRequestRemoveClassification: vi.fn(),
  ...overrides,
});

describe('SpaceSettingsAboutView — Classifications block', () => {
  it('a hidden entry (display: false) renders "Not shown on the Space page", never "private" (R-8, FR-010d)', async () => {
    render(<SpaceSettingsAboutView {...baseProps({ classifications: [{ ...ENTRY, display: false }] })} />);
    expect(await screen.findByText('Not shown on the Space page')).toBeInTheDocument();
    expect(screen.queryByText(/private|secret|hidden from/i)).not.toBeInTheDocument();
  });

  it('a shown entry (display: true) renders "Show on the Space page", and flipping the switch reports display:false', async () => {
    const onToggleClassificationDisplay = vi.fn();
    render(
      <SpaceSettingsAboutView
        {...baseProps({ classifications: [{ ...ENTRY, display: true }], onToggleClassificationDisplay })}
      />
    );
    expect(await screen.findByText('Show on the Space page')).toBeInTheDocument();
    expect(screen.queryByText('Not shown on the Space page')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch'));
    expect(onToggleClassificationDisplay).toHaveBeenCalledWith('entry-1', false);
  });

  it('disables the value selector for an entry whose selection write is pending', async () => {
    render(
      <SpaceSettingsAboutView
        {...baseProps({ classifications: [ENTRY], classificationSelectionPendingIds: ['entry-1'] })}
      />
    );
    expect(await screen.findAllByRole('checkbox')).not.toHaveLength(0);
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toBeDisabled();
    }
  });

  it('leaves the value selector enabled for an entry with no pending write', async () => {
    render(
      <SpaceSettingsAboutView {...baseProps({ classifications: [ENTRY], classificationSelectionPendingIds: [] })} />
    );
    expect(await screen.findAllByRole('checkbox')).not.toHaveLength(0);
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).not.toBeDisabled();
    }
  });

  it('the trash affordance requests removal via onRequestRemoveClassification, never removes directly', async () => {
    const onRequestRemoveClassification = vi.fn();
    render(<SpaceSettingsAboutView {...baseProps({ classifications: [ENTRY], onRequestRemoveClassification })} />);
    const removeButton = await screen.findByRole('button', { name: 'Remove classification' });
    await userEvent.click(removeButton);
    expect(onRequestRemoveClassification).toHaveBeenCalledWith('entry-1');
    expect(onRequestRemoveClassification).toHaveBeenCalledTimes(1);
    // Removing is the connector's job (owns the confirm dialog + mutation) — the
    // view has no other classification-removal callback to fall back to.
  });
});
