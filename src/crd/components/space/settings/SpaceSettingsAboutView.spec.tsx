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
  onChange: vi.fn(),
  onUploadAvatar: vi.fn(),
  onUploadPageBanner: vi.fn(),
  onUploadCardBanner: vi.fn(),
  onReferencesChange: vi.fn(),
  classifications: [ENTRY],
  unsavedClassificationIds: [],
  onAddClassification: vi.fn(),
  onSelectClassificationValues: vi.fn(),
  onToggleClassificationDisplay: vi.fn(),
  onRemoveClassification: vi.fn(),
  ...overrides,
});

/** Open an entry card's kebab menu (design 01 — actions live behind "…"). */
async function openEntryMenu(label = 'SDGs') {
  await userEvent.click(await screen.findByRole('button', { name: `Classification actions: ${label}` }));
}

describe('SpaceSettingsAboutView — Classifications block', () => {
  it('a hidden entry (display: false) renders a "Not shown on the Space page" badge, never "private" (R-8, FR-010d)', async () => {
    render(<SpaceSettingsAboutView {...baseProps({ classifications: [{ ...ENTRY, display: false }] })} />);
    expect(await screen.findByText('Not shown on the Space page')).toBeInTheDocument();
    expect(screen.queryByText(/private|secret|hidden from/i)).not.toBeInTheDocument();
  });

  it('shows the cardinality · selected-count meta line (design 01)', async () => {
    render(<SpaceSettingsAboutView {...baseProps({ classifications: [ENTRY] })} />);
    expect(await screen.findByText('Multi-select · 1 selected')).toBeInTheDocument();
  });

  it('the kebab menu holds the display switch; toggling it reports display:false', async () => {
    const onToggleClassificationDisplay = vi.fn();
    render(
      <SpaceSettingsAboutView
        {...baseProps({ classifications: [{ ...ENTRY, display: true }], onToggleClassificationDisplay })}
      />
    );
    expect(screen.queryByText('Not shown on the Space page')).not.toBeInTheDocument();

    await openEntryMenu();
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Show on the Space page' }));
    expect(onToggleClassificationDisplay).toHaveBeenCalledWith('entry-1', false);
  });

  it('selected values render as chips; the chip × emits the full remaining selection (FR-012d)', async () => {
    const onSelectClassificationValues = vi.fn();
    render(
      <SpaceSettingsAboutView
        {...baseProps({
          classifications: [{ ...ENTRY, selectedValueIDs: ['sdg-13', 'sdg-14'] }],
          onSelectClassificationValues,
        })}
      />
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Deselect 13 · Climate Action' }));
    // Full replacement — the remaining list, not a per-value delta.
    expect(onSelectClassificationValues).toHaveBeenCalledWith('entry-1', ['sdg-14']);
  });

  it('an entry with no selection prompts with every value as a "+" chip (FR-012a)', async () => {
    render(<SpaceSettingsAboutView {...baseProps({ classifications: [{ ...ENTRY, selectedValueIDs: [] }] })} />);
    expect(await screen.findByRole('button', { name: 'Select 13 · Climate Action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select 14 · Life Below Water' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('a "+" chip adds to a multi-select in authored order, and replaces a single-select (FR-012, FR-002b)', async () => {
    const onSelectClassificationValues = vi.fn();
    const { unmount } = render(
      <SpaceSettingsAboutView
        {...baseProps({
          classifications: [{ ...ENTRY, selectedValueIDs: ['sdg-14'] }],
          onSelectClassificationValues,
        })}
      />
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Select 13 · Climate Action' }));
    expect(onSelectClassificationValues).toHaveBeenLastCalledWith('entry-1', ['sdg-13', 'sdg-14']);
    unmount();

    render(
      <SpaceSettingsAboutView
        {...baseProps({
          classifications: [{ ...ENTRY, cardinality: 'SINGLE_SELECT', selectedValueIDs: ['sdg-14'] }],
          onSelectClassificationValues,
        })}
      />
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Select 13 · Climate Action' }));
    expect(onSelectClassificationValues).toHaveBeenLastCalledWith('entry-1', ['sdg-13']);
  });

  it('"Select values…" in the kebab expands the selector', async () => {
    render(<SpaceSettingsAboutView {...baseProps({ classifications: [ENTRY] })} />);
    // Selection exists → selector starts collapsed.
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await openEntryMenu();
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Select values…' }));
    expect(await screen.findAllByRole('checkbox')).toHaveLength(2);
  });

  it('marks a classification added locally and not saved yet as Unsaved', async () => {
    render(
      <SpaceSettingsAboutView {...baseProps({ classifications: [ENTRY], unsavedClassificationIds: ['entry-1'] })} />
    );
    expect(await screen.findByText('Unsaved')).toBeInTheDocument();
  });

  it('Remove in the kebab hands the removal to onRemoveClassification (staged by the consumer, no confirm)', async () => {
    const onRemoveClassification = vi.fn();
    render(<SpaceSettingsAboutView {...baseProps({ classifications: [ENTRY], onRemoveClassification })} />);
    await openEntryMenu();
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Remove classification' }));
    expect(onRemoveClassification).toHaveBeenCalledWith('entry-1');
    expect(onRemoveClassification).toHaveBeenCalledTimes(1);
  });

  it('renders no per-section Save button — saving is the unsaved-changes bar', async () => {
    render(<SpaceSettingsAboutView {...baseProps({ name: 'Renamed' })} />);
    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
  });

  it('the Add Classification button sits below the entry list (design 01)', async () => {
    render(<SpaceSettingsAboutView {...baseProps({ classifications: [ENTRY] })} />);
    const addButton = await screen.findByRole('button', { name: 'Add Classification' });
    const card = screen.getByText('SDGs').closest('div[class*="rounded-lg"]');
    expect(card).not.toBeNull();
    expect(addButton.compareDocumentPosition(card as Element) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });
});

describe('SpaceSettingsAboutView — section defaults (spec 045 Session 2026-10-22)', () => {
  it('opens only Identity; every other section starts collapsed', async () => {
    render(<SpaceSettingsAboutView {...baseProps()} />);
    const toggles = await screen.findAllByRole('button', { expanded: false });
    const open = screen.getAllByRole('button', { expanded: true });
    expect(open.map(b => b.textContent)).toEqual(['Identity']);
    expect(toggles.map(b => b.textContent)).toEqual(
      expect.arrayContaining(['Visuals', 'Location', 'Context', 'Tags', 'References & Links'])
    );
  });
});
