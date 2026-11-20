import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import type { ContributorSelectorInvitee } from '@/crd/forms/ContributorSelector';
import { FramingEditorConnector } from './FramingEditorConnector';
import type { SelectionCandidate } from './useSelectionCandidates';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const baseProps = {
  linkUrl: '',
  onLinkUrlChange: vi.fn(),
  linkDisplayName: '',
  onLinkDisplayNameChange: vi.fn(),
  pollQuestion: '',
  onPollQuestionChange: vi.fn(),
  pollOptions: [],
  onPollOptionsChange: vi.fn(),
  mediaGalleryVisuals: [],
  onMediaGalleryVisualsChange: vi.fn(),
  collaboraDocumentType: CollaboraDocumentType.Wordprocessing,
  onCollaboraDocumentTypeChange: vi.fn(),
};

const PERSON: SelectionCandidate = { id: 'user-1', displayName: 'Alpha Person', kind: 'user' };
const ORG: SelectionCandidate = { id: 'org-1', displayName: 'Alpha Org', kind: 'organization' };
const VC: SelectionCandidate = { id: 'vc-1', displayName: 'Alpha VC', kind: 'virtualContributor' };

type ContributorProps = Partial<React.ComponentProps<typeof FramingEditorConnector>>;

const renderEditor = (props: ContributorProps) =>
  render(
    <FramingEditorConnector
      {...baseProps}
      framingType="contributors"
      contributorCollection={{ types: ['user'], defaultType: 'user', defaultView: 'list' }}
      onContributorCollectionChange={vi.fn()}
      {...props}
    />
  );

/**
 * The result dropdown is query-gated (`ContributorSelector` renders rows only
 * when its `searchQuery` is non-empty) and the query is connector-local state —
 * so a render with props alone shows zero rows and any assertion over result
 * rows would pass vacuously. Every candidate shares the substring 'Alpha'.
 */
const renderWithQuery = async (props: ContributorProps) => {
  renderEditor({ selectionMode: 'custom', ...props });
  await userEvent.type(screen.getByLabelText('forms.selection.searchAriaLabel'), 'Alpha');
};

const chip = (id: string, displayName: string, kind: 'user' | 'organization'): ContributorSelectorInvitee =>
  kind === 'user'
    ? { kind: 'user', userId: id, displayName, eligible: true }
    : { kind: 'organization', id, displayName, eligible: true };

describe('FramingEditorConnector — contributor selection', () => {
  it('switching to manual selection does not rewrite the contributor types', async () => {
    const onContributorCollectionChange = vi.fn();
    renderEditor({ selectionMode: 'auto', onSelectionModeChange: vi.fn(), onContributorCollectionChange });

    await userEvent.click(screen.getByLabelText('forms.selection.label'));

    expect(onContributorCollectionChange).not.toHaveBeenCalled();
  });

  it('keeps the type controls visible and live in manual mode', async () => {
    const allTypes = renderEditor({
      selectionMode: 'custom',
      contributorCollection: {
        types: ['user', 'organization', 'virtualContributor'],
        defaultType: 'user',
        defaultView: 'list',
      },
    });

    expect(screen.getByText('contributors.config.typesLabel')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'contributors.config.defaultTypeLabel' })).toBeInTheDocument();
    allTypes.unmount();

    // Rendered is not enough — the control must still emit, since this is the
    // only way a callout the deleted clamp wrote as users-only reaches orgs.
    const onContributorCollectionChange = vi.fn();
    renderEditor({ selectionMode: 'custom', onContributorCollectionChange });
    await userEvent.click(screen.getByRole('button', { name: 'contributors.types.organization' }));

    expect(onContributorCollectionChange).toHaveBeenCalledWith(
      expect.objectContaining({ types: ['user', 'organization'] })
    );
  });

  it('applies no kind predicate of its own — the hook owns that rule', async () => {
    await renderWithQuery({ contributorCandidates: [PERSON, ORG, VC] });

    expect(screen.getByText('Alpha Person')).toBeInTheDocument();
    expect(screen.getByText('Alpha Org')).toBeInTheDocument();
    expect(screen.getByText('Alpha VC')).toBeInTheDocument();
  });

  it('labels each result with its kind and appends the picked id', async () => {
    const onSelectedIdsChange = vi.fn();
    await renderWithQuery({
      contributorCandidates: [PERSON, ORG],
      selectedIds: ['user-9'],
      onSelectedIdsChange,
    });

    expect(screen.getByText('Alpha Person').closest('button')).toHaveTextContent('contributors.types.user');
    expect(screen.getByText('Alpha Org').closest('button')).toHaveTextContent('contributors.types.organization');

    await userEvent.click(screen.getByText('Alpha Org'));

    expect(onSelectedIdsChange).toHaveBeenCalledWith(['user-9', 'org-1']);
  });

  // Inverts 084 FR-006 (the selected entry used to be filtered out of the
  // results): feature 088 keeps it listed as a ticked toggle instead. Both
  // kinds the old de-dupe covered are asserted.
  it('keeps an already-selected organization listed as a ticked row that untoggles', async () => {
    const onSelectedIdsChange = vi.fn();
    await renderWithQuery({
      contributorCandidates: [PERSON, ORG],
      selectedIds: ['org-1'],
      onSelectedIdsChange,
      // A different display name, so each assertion can only match a result row.
      resolveContributorChips: () => [chip('org-1', 'Chip Org', 'organization')],
    });

    const row = screen.getByText('Alpha Org').closest('button');
    expect(row).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Alpha Person').closest('button')).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(screen.getByText('Alpha Org'));

    expect(onSelectedIdsChange).toHaveBeenCalledWith([]);
  });

  it('keeps an already-selected user listed as a ticked row that untoggles', async () => {
    const onSelectedIdsChange = vi.fn();
    await renderWithQuery({
      contributorCandidates: [PERSON, ORG],
      selectedIds: ['user-1'],
      onSelectedIdsChange,
      resolveContributorChips: () => [chip('user-1', 'Chip Person', 'user')],
    });

    expect(screen.getByText('Alpha Person').closest('button')).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByText('Alpha Person'));

    expect(onSelectedIdsChange).toHaveBeenCalledWith([]);
  });

  it('leaves selectedIds unchanged whether the chip is removed or the row untoggled', async () => {
    const viaRow = vi.fn();
    const { unmount } = renderEditor({
      selectionMode: 'custom',
      selectedIds: ['user-1', 'org-1'],
      contributorCandidates: [PERSON, ORG],
      onSelectedIdsChange: viaRow,
      resolveContributorChips: () => [chip('user-1', 'Chip Person', 'user'), chip('org-1', 'Chip Org', 'organization')],
    });
    await userEvent.type(screen.getByLabelText('forms.selection.searchAriaLabel'), 'Alpha Person');
    await userEvent.click(screen.getByText('Alpha Person'));
    unmount();

    const viaChip = vi.fn();
    renderEditor({
      selectionMode: 'custom',
      selectedIds: ['user-1', 'org-1'],
      contributorCandidates: [PERSON, ORG],
      onSelectedIdsChange: viaChip,
      resolveContributorChips: () => [chip('user-1', 'Chip Person', 'user'), chip('org-1', 'Chip Org', 'organization')],
    });
    await userEvent.click(screen.getAllByLabelText('forms.selection.removeAriaLabel')[0]);

    expect(viaRow).toHaveBeenCalledWith(['org-1']);
    expect(viaChip).toHaveBeenCalledWith(['org-1']);
  });

  // #10418: the chip was relabelled before the candidate set arrived, so every
  // selected entry briefly read "No longer available". The fixture is the shape
  // `useSelectionCandidates.resolveChips` really returns for an id it cannot
  // resolve — `displayName === id` — so the pending chip must read neither that
  // raw uuid nor the stale label.
  it('labels a chip "loading" while the candidate set is still loading', () => {
    renderEditor({
      selectionMode: 'custom',
      selectedIds: ['user-1'],
      contributorCandidates: [],
      contributorCandidatesLoading: true,
      contributorCandidatesUnresolved: true,
      resolveContributorChips: () => [
        { kind: 'virtualContributor', id: 'user-1', displayName: 'user-1', eligible: false },
      ],
    });

    expect(screen.getByText('forms.selection.loading')).toBeInTheDocument();
    expect(screen.queryByText('user-1')).not.toBeInTheDocument();
    expect(screen.queryByText('forms.selection.noLongerAvailable')).not.toBeInTheDocument();
  });

  // The state the 088 review held on: the candidate query is SKIPPED (no
  // roleSetId), and a skipped Apollo query reports `loading: false`. Deriving the
  // chip label from `loading` alone therefore read the empty candidate set as
  // "everyone left" and relabelled every chip — the exact #10418 symptom, through
  // a second door. The form connector owns one `unresolved` predicate for this
  // (`loading || !roleSetId`) and the save paths already depend on it; this case
  // is what fails if the editor ever goes back to deriving it from `loading`.
  it('labels a chip "loading" when the candidate query was skipped, not just when it is in flight', () => {
    renderEditor({
      selectionMode: 'custom',
      selectedIds: ['user-1'],
      contributorCandidates: [],
      // A skipped query is NOT loading — this is the whole point of the case.
      contributorCandidatesLoading: false,
      contributorCandidatesUnresolved: true,
      resolveContributorChips: () => [
        { kind: 'virtualContributor', id: 'user-1', displayName: 'user-1', eligible: false },
      ],
    });

    expect(screen.getByText('forms.selection.loading')).toBeInTheDocument();
    expect(screen.queryByText('forms.selection.noLongerAvailable')).not.toBeInTheDocument();
    expect(screen.queryByText('user-1')).not.toBeInTheDocument();
  });

  it('labels a stale chip once the candidate set has arrived', () => {
    renderEditor({
      selectionMode: 'custom',
      selectedIds: ['stale-1'],
      contributorCandidates: [PERSON],
      contributorCandidatesLoading: true,
      contributorCandidatesUnresolved: true,
      resolveContributorChips: () => [
        { kind: 'virtualContributor', id: 'stale-1', displayName: 'stale-1', eligible: false },
      ],
    });

    expect(screen.getByText('forms.selection.noLongerAvailable')).toBeInTheDocument();
  });

  it('labels a stale chip instead of showing its raw id', () => {
    renderEditor({
      selectionMode: 'custom',
      selectedIds: ['stale-1'],
      resolveContributorChips: () => [
        { kind: 'virtualContributor', id: 'stale-1', displayName: 'stale-1', eligible: false },
      ],
    });

    expect(screen.getByText('forms.selection.noLongerAvailable')).toBeInTheDocument();
    expect(screen.queryByText('stale-1')).not.toBeInTheDocument();
  });

  it('removes the chip at the clicked position', async () => {
    const onSelectedIdsChange = vi.fn();
    renderEditor({
      selectionMode: 'custom',
      selectedIds: ['user-1', 'org-1'],
      onSelectedIdsChange,
      resolveContributorChips: () => [
        chip('user-1', 'Alpha Person', 'user'),
        chip('org-1', 'Chip Org', 'organization'),
      ],
    });

    await userEvent.click(screen.getAllByLabelText('forms.selection.removeAriaLabel')[1]);

    expect(onSelectedIdsChange).toHaveBeenCalledWith(['user-1']);
  });
});
