/** @vitest-environment jsdom */
/**
 * The FR-014 guard, and the reason chunk D exists (084 T104).
 *
 * 025's spaces picker stripped every stored id that was not in its candidate set
 * before submitting. With the candidate set widened to the whole account, a space
 * the editor cannot READ is not a candidate — so that strip would delete it from
 * the stored selection on any save, and a still-loading or errored candidate set
 * would delete ALL of them. T103 deletes the strip; these cases are what fails if
 * anyone puts it back, in every state the candidate query can be in.
 *
 * The assertions are on the values handed to `mapFormToCalloutUpdateInput` /
 * `mapFormToCalloutCreationInput` — the submitted value is computed in the
 * connector, not in the hook and not in the mapper.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  CalloutContributionType,
  CalloutFramingType,
  CalloutSelectionMode,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import type { CalloutFormValues } from '@/main/crdPages/space/hooks/useCrdCalloutForm';

/** A space of the account the editor can see, and one that has left it. */
const RESOLVABLE = 'space-resolvable';
const UNRESOLVABLE = 'space-departed';
const STORED = [RESOLVABLE, UNRESOLVABLE];

/** The same pair for the contributors chip: one still a member, one departed. */
const MEMBER = 'user-member';
const DEPARTED = 'user-departed';
const STORED_CONTRIBUTORS = [MEMBER, DEPARTED];

const harness = vi.hoisted(() => ({
  spaceCanUpdate: true,
  candidateOptions: [] as { hostSpaceId: string | undefined; skip?: boolean }[],
  candidatesLoading: false,
  candidatesError: undefined as Error | undefined,
  candidateRefetch: vi.fn(),
  /** Which callout the edit dialog loads — the Spaces fixture by default. */
  editedCallout: undefined as unknown,
  contributorCandidatesError: undefined as Error | undefined,
  updateCallout: vi.fn(),
  createCallout: vi.fn(),
  submittedUpdates: [] as Partial<CalloutFormValues>[],
  submittedCreations: [] as Partial<CalloutFormValues>[],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params && 'count' in params ? `${key}:${params.count}` : key,
  }),
}));

vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: ({ value, onChange }: { value: string; onChange: (next: string) => void }) => (
    <textarea aria-label="description-editor" value={value} onChange={e => onChange(e.target.value)} />
  ),
}));

/** The callout being edited: a Spaces collection whose CUSTOM selection holds both ids. */
const editedCallout = {
  lookup: {
    callout: {
      id: 'callout-1',
      framing: {
        type: CalloutFramingType.Spaces,
        profile: { id: 'profile-1', displayName: 'Our spaces', description: '', tagsets: [], references: [] },
      },
      settings: {
        framing: {
          commentsEnabled: false,
          selection: { mode: CalloutSelectionMode.Custom, selectedIds: STORED },
        },
        contribution: {
          enabled: false,
          allowedTypes: [CalloutContributionType.Post],
          canAddContributions: [],
          commentsEnabled: false,
        },
      },
      contributionDefaults: {
        defaultDisplayName: '',
        postDescription: null,
        whiteboardContentAvailable: false,
      },
    },
  },
};

/** The same callout as a Contributors collection, whose CUSTOM selection holds both ids. */
const editedContributorsCallout = {
  lookup: {
    callout: {
      ...editedCallout.lookup.callout,
      framing: {
        type: CalloutFramingType.Contributors,
        profile: { id: 'profile-1', displayName: 'Our people', description: '', tagsets: [], references: [] },
      },
      settings: {
        ...editedCallout.lookup.callout.settings,
        framing: {
          commentsEnabled: false,
          selection: { mode: CalloutSelectionMode.Custom, selectedIds: STORED_CONTRIBUTORS },
        },
      },
    },
  },
};

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutFormResponsesQuery: () => ({ data: undefined, refetch: vi.fn() }),
  useCalloutContentQuery: () => ({ data: harness.editedCallout, loading: false }),
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useDeleteReferenceMutation: () => [vi.fn()],
  useTemplateContentLazyQuery: () => [vi.fn()],
  useUpdateCalloutContentMutation: () => [harness.updateCallout, { loading: false }],
  useUpdateCalloutFormMutation: () => [vi.fn()],
  useUpdatePollStatusMutation: () => [vi.fn()],
}));

vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    space: { about: { membership: { roleSetID: 'role-set-1' } }, levelZeroSpaceId: 'space-host' },
    entitlements: [],
    permissions: { canUpdate: harness.spaceCanUpdate },
    loading: false,
  }),
}));

vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({ subspace: { id: '' }, permissions: { canUpdate: false }, loading: false }),
}));

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ spaceId: 'space-host' }),
}));

vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  StorageConfigContextProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useStorageConfigContext: () => ({ storageBucketId: 'bucket-1' }),
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

vi.mock('@/main/crdPages/markdown/useMarkdownEditorIntegration', () => ({
  useMarkdownEditorIntegration: () => ({ onImageUpload: vi.fn(), iframeAllowedUrls: [], onError: vi.fn() }),
}));

vi.mock('@/main/crdPages/utils/useReferenceFileUpload', () => ({
  useReferenceFileUpload: () => ({ onUpload: vi.fn(), uploading: false }),
}));

vi.mock('@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation', () => ({
  useCalloutCreation: () => ({ handleCreateCallout: harness.createCallout, loading: false }),
}));

vi.mock('@/domain/collaboration/whiteboard/WhiteboardDraft/useWhiteboardDraft', () => ({
  useWhiteboardDraft: () => ({ loading: false, discard: vi.fn(), consumed: vi.fn(), handle: undefined }),
}));

vi.mock('@/domain/collaboration/whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals', () => ({
  default: () => ({ uploadVisuals: vi.fn() }),
}));

vi.mock('@/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals', () => ({
  default: () => ({ uploadMediaGalleryVisuals: vi.fn(), uploading: false }),
}));

vi.mock('@/domain/collaboration/poll/hooks/usePollOptionManagement', () => ({
  usePollOptionManagement: () => ({}),
}));

vi.mock('@/domain/collaboration/calloutContributions/collaboraDocument/useRenameCollaboraDocument', () => ({
  useRenameCollaboraDocument: () => ({ rename: vi.fn() }),
}));

vi.mock('../hooks/useCrdSpaceContributors', () => ({
  useCrdSpaceContributors: () => ({ defaultType: undefined, getCards: () => [] }),
}));

/**
 * Mirrors the real hook's shape where it matters here: a failed query reports
 * `loading: false` with NO data, so its membership map is empty and every stored
 * id resolves ineligible — which is exactly the state in which the save path's
 * strip deletes the whole curated selection.
 */
vi.mock('./useSelectionCandidates', async importOriginal => {
  const actual = await importOriginal<typeof import('./useSelectionCandidates')>();
  return {
    ...actual,
    useSelectionCandidates: () => {
      const members = harness.contributorCandidatesError ? [] : [MEMBER];
      return {
        candidates: members.map(id => ({ id, displayName: id, kind: 'user' as const })),
        loading: false,
        error: harness.contributorCandidatesError,
        resolveChips: (selectedIds: string[]) =>
          selectedIds.map(id =>
            members.includes(id)
              ? { kind: 'user' as const, userId: id, displayName: id, eligible: true }
              : { kind: 'virtualContributor' as const, id, displayName: id, eligible: false }
          ),
        refetch: vi.fn(),
      };
    },
  };
});

/**
 * The candidate model. Only `RESOLVABLE` is in the account, so `UNRESOLVABLE` is
 * exactly the id 025's strip would have deleted.
 */
vi.mock('./useAccountSpaceCandidates', () => ({
  useAccountSpaceCandidates: (options: { hostSpaceId: string | undefined; skip?: boolean }) => {
    harness.candidateOptions.push(options);
    const resolved =
      options.skip || harness.candidatesLoading || harness.candidatesError
        ? []
        : [
            {
              id: RESOLVABLE,
              displayName: 'Resolvable space',
              level: SpaceLevel.L1,
              ancestorPath: [],
              isHost: false,
              inHostTree: false,
              hasNameClash: false,
            },
          ];
    return {
      candidates: resolved,
      loading: harness.candidatesLoading,
      error: harness.candidatesError,
      refetch: harness.candidateRefetch,
    };
  },
}));

/** Spy on what the connector actually submits, then run the real mapper. */
vi.mock('./calloutFormMapper', async importOriginal => {
  const actual = await importOriginal<typeof import('./calloutFormMapper')>();
  return {
    ...actual,
    mapFormToCalloutUpdateInput: (values: Parameters<typeof actual.mapFormToCalloutUpdateInput>[0], options: never) => {
      harness.submittedUpdates.push(values);
      return actual.mapFormToCalloutUpdateInput(values, options);
    },
    mapFormToCalloutCreationInput: (
      values: Parameters<typeof actual.mapFormToCalloutCreationInput>[0],
      options: never
    ) => {
      harness.submittedCreations.push(values);
      return actual.mapFormToCalloutCreationInput(values, options);
    },
  };
});

/** Create mode has no server prefill, so the stored selection arrives from a template. */
vi.mock('@/main/crdPages/templates/loadCalloutTemplateFormValues', () => ({
  loadCalloutTemplateFormValues: () =>
    Promise.resolve({
      title: 'Our spaces',
      framingChip: 'spaces',
      selectionMode: 'custom',
      selectedIds: STORED,
    } satisfies Partial<CalloutFormValues>),
}));

vi.mock('./ResponseDefaultsConnector', () => ({ ResponseDefaultsConnector: () => null }));
vi.mock('./TemplateImportConnector', () => ({ TemplateImportConnector: () => null }));

const { CalloutFormConnector } = await import('./CalloutFormConnector');

// The spaces kind carries its own switch label since 084 T106; the
// contributors kind keeps `forms.selection.label` (FR-021).
const MANUAL_SELECTION_SWITCH = 'forms.selection.spaces.switchLabel';

const renderEdit = async (title = 'Our spaces') => {
  render(
    <CalloutFormConnector open={true} onOpenChange={vi.fn()} mode="edit" calloutId="callout-1" calloutsSetId="set-1" />
  );
  await waitFor(() => expect(screen.getByLabelText('forms.titleLabel')).toHaveValue(title));
};

const renderCreate = async () => {
  render(
    <CalloutFormConnector
      open={true}
      onOpenChange={vi.fn()}
      mode="create"
      calloutsSetId="set-1"
      defaultTemplateId="template-1"
    />
  );
  await waitFor(() => expect(screen.getByLabelText('forms.titleLabel')).toHaveValue('Our spaces'));
};

const submit = async (name: RegExp) =>
  act(async () => {
    fireEvent.click(screen.getByRole('button', { name }));
  });

const save = () => submit(/forms\.save/i);
const publish = () => submit(/forms\.publish/i);

beforeEach(() => {
  harness.spaceCanUpdate = true;
  harness.candidateOptions = [];
  harness.candidatesLoading = false;
  harness.candidatesError = undefined;
  harness.editedCallout = editedCallout;
  harness.contributorCandidatesError = undefined;
  harness.candidateRefetch = vi.fn();
  harness.submittedUpdates = [];
  harness.submittedCreations = [];
  harness.updateCallout = vi.fn().mockResolvedValue({ data: { updateCallout: { id: 'callout-1', framing: {} } } });
  harness.createCallout = vi.fn().mockResolvedValue({ id: 'callout-2' });
});

describe('CalloutFormConnector — the spaces selection is submitted unchanged (FR-014)', () => {
  test('on update, including an id with no candidate entry', async () => {
    await renderEdit();
    await save();

    expect(harness.submittedUpdates).toHaveLength(1);
    expect(harness.submittedUpdates[0].selectedIds).toEqual(STORED);
  });

  test('on create, including an id with no candidate entry', async () => {
    await renderCreate();
    await publish();

    expect(harness.submittedCreations).toHaveLength(1);
    expect(harness.submittedCreations[0].selectedIds).toEqual(STORED);
  });

  test('while the candidate query is still loading', async () => {
    harness.candidatesLoading = true;
    await renderEdit();
    await save();

    expect(harness.submittedUpdates[0].selectedIds).toEqual(STORED);
  });

  // The regression this file exists for: `loading === false` with `data === undefined`
  // used to be indistinguishable from "resolved, and this account has no spaces",
  // which is the state in which a strip deletes the entire curated selection.
  test('when the candidate query has errored', async () => {
    harness.candidatesError = new Error('Forbidden');
    await renderEdit();
    await save();

    expect(harness.submittedUpdates[0].selectedIds).toEqual(STORED);
  });

  test('when the candidate query was never issued', async () => {
    harness.spaceCanUpdate = false;
    await renderEdit();
    await save();

    expect(harness.candidateOptions.every(o => o.skip)).toBe(true);
    expect(harness.submittedUpdates[0].selectedIds).toEqual(STORED);
  });

  // The admin removes the offending chip explicitly; nothing is dropped for them.
  // RED against the self-healing strip of rejected alternative A24.
  test('and still unchanged on the retry after the server rejects the save', async () => {
    harness.updateCallout = vi
      .fn()
      .mockRejectedValueOnce(new Error('out of account'))
      .mockResolvedValue({ data: { updateCallout: { id: 'callout-1', framing: {} } } });

    await renderEdit();
    await save();

    expect(harness.candidateRefetch).toHaveBeenCalled();

    await save();

    expect(harness.submittedUpdates).toHaveLength(2);
    expect(harness.submittedUpdates[1].selectedIds).toEqual(STORED);
  });
});

/**
 * The contributors chip keeps its client-side strip (the spaces one was deleted
 * outright by 084 T103), so for contributors the "unresolved" predicate is the
 * ONLY thing standing between a failed candidate query and a wiped selection:
 * an errored Apollo query reports `loading: false` with no data, every stored id
 * resolves ineligible against the empty membership map, and the strip submits
 * `[]`. The pair below is the discriminating case — the first test proves the
 * strip is genuinely live (so the second cannot pass by the strip being absent),
 * the second proves it is skipped when the query failed.
 */
describe('CalloutFormConnector — the contributor selection and a failed candidate query', () => {
  test('a departed contributor IS stripped once the candidate set has resolved', async () => {
    harness.editedCallout = editedContributorsCallout;
    await renderEdit('Our people');
    await save();

    expect(harness.submittedUpdates).toHaveLength(1);
    expect(harness.submittedUpdates[0].selectedIds).toEqual([MEMBER]);
  });

  test('but nothing is stripped when the candidate query has errored', async () => {
    harness.editedCallout = editedContributorsCallout;
    harness.contributorCandidatesError = new Error('Forbidden');
    await renderEdit('Our people');
    await save();

    expect(harness.submittedUpdates).toHaveLength(1);
    expect(harness.submittedUpdates[0].selectedIds).toEqual(STORED_CONTRIBUTORS);
  });
});

/**
 * FR-009a: a callout creator who has since been demoted still holds UPDATE on the
 * callout and can open this dialog, but holds no UPDATE on the space — which is
 * what `accountSpaces` is gated on. The remedy is deletion, not a degraded screen:
 * the block is not rendered, so there is nothing to explain and no query to fail.
 */
describe('CalloutFormConnector — a non-admin editor in edit mode', () => {
  test('is not shown the manual-selection block at all', async () => {
    harness.spaceCanUpdate = false;
    await renderEdit();

    expect(screen.queryByRole('switch', { name: MANUAL_SELECTION_SWITCH })).toBeNull();
    // The spaces framing editor still rendered — without this the absence above
    // would also pass for a form that rendered no framing editor whatsoever.
    expect(screen.getByRole('switch', { name: 'forms.cardVariant.label' })).toBeInTheDocument();
  });

  test('is shown it when they are a space admin', async () => {
    await renderEdit();

    expect(screen.getByRole('switch', { name: MANUAL_SELECTION_SWITCH })).toBeInTheDocument();
  });
});
