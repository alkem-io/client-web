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
  const utils = renderEditor({ selectionMode: 'custom', ...props });
  await userEvent.type(screen.getByLabelText('forms.selection.searchAriaLabel'), 'Alpha');
  return utils;
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

  it('excludes an already-selected organization from the results', async () => {
    await renderWithQuery({
      contributorCandidates: [PERSON, ORG],
      selectedIds: ['org-1'],
      // A different display name, so each assertion can only match a result row.
      resolveContributorChips: () => [chip('org-1', 'Chip Org', 'organization')],
    });

    expect(screen.queryByText('Alpha Org')).not.toBeInTheDocument();
    expect(screen.getByText('Alpha Person')).toBeInTheDocument();
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
        chip('org-1', 'Alpha Org', 'organization'),
      ],
    });

    await userEvent.click(screen.getAllByLabelText('forms.selection.removeAriaLabel')[1]);

    expect(onSelectedIdsChange).toHaveBeenCalledWith(['user-1']);
  });
});
