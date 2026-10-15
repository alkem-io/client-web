/**
 * A manually picked template ("Find Template") is clamped to the framings the viewer is offered,
 * which depends on the admin privilege. The permission contexts default to `canUpdate: false` while
 * loading, so the picker must not be openable until they have loaded — otherwise an admin's Form
 * pick would be silently cleared to None.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { CollaboraDocumentType, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';

const mocks = vi.hoisted(() => ({
  handleCreateCallout: vi.fn(),
  spaceCanUpdate: false,
  subspaceId: '',
  subspaceCanUpdate: false,
  spaceLoading: false,
  subspaceLoading: false,
  parentSpaceId: undefined as string | undefined,
  entitlements: [] as string[],
  pick: undefined as undefined | ((values: Record<string, unknown>) => void),
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

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutFormResponsesQuery: () => ({ data: undefined, refetch: vi.fn() }),
  useCalloutContentQuery: () => ({ data: undefined, loading: false }),
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useDeleteReferenceMutation: () => [vi.fn()],
  useTemplateContentLazyQuery: () => [vi.fn()],
  useUpdateCalloutContentMutation: () => [vi.fn(), { loading: false }],
  useUpdateCalloutFormMutation: () => [vi.fn()],
  useUpdatePollStatusMutation: () => [vi.fn()],
}));

vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    space: { about: { membership: { roleSetID: 'role-set-1' } } },
    entitlements: mocks.entitlements,
    permissions: { canUpdate: mocks.spaceCanUpdate },
    loading: mocks.spaceLoading,
  }),
}));

vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({
    subspace: { id: mocks.subspaceId },
    permissions: { canUpdate: mocks.subspaceCanUpdate },
    loading: mocks.subspaceLoading,
  }),
}));

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ spaceId: 'space-1', parentSpaceId: mocks.parentSpaceId }),
}));

vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  StorageConfigContextProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useStorageConfigContext: () => ({ storageBucketId: 'bucket-1' }),
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

vi.mock('@/main/crdPages/markdown/useMarkdownEditorIntegration', () => ({
  useMarkdownEditorIntegration: () => ({
    onImageUpload: vi.fn(),
    iframeAllowedUrls: [],
    onError: vi.fn(),
  }),
}));

vi.mock('@/main/crdPages/utils/useReferenceFileUpload', () => ({
  useReferenceFileUpload: () => ({ onUpload: vi.fn(), uploading: false }),
}));

vi.mock('@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation', () => ({
  useCalloutCreation: () => ({ handleCreateCallout: mocks.handleCreateCallout, loading: false }),
}));

vi.mock('@/domain/collaboration/whiteboard/WhiteboardDraft/useWhiteboardDraft', () => ({
  useWhiteboardDraft: () => ({ loading: false, discard: vi.fn(), handle: undefined }),
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

vi.mock('./useAccountSpaceCandidates', () => ({
  useAccountSpaceCandidates: () => ({ candidates: [], loading: false, error: undefined, refetch: vi.fn() }),
}));

vi.mock('./useSelectionCandidates', async importOriginal => {
  const actual = await importOriginal<typeof import('./useSelectionCandidates')>();
  return {
    ...actual,
    useSelectionCandidates: () => ({
      candidates: [],
      loading: false,
      resolveChips: () => [],
      refetch: vi.fn(),
    }),
  };
});

vi.mock('../hooks/useCrdSpaceContributors', () => ({
  useCrdSpaceContributors: () => ({ defaultType: undefined, getCards: () => [] }),
}));

vi.mock('./FramingEditorConnector', () => ({ FramingEditorConnector: () => null }));
vi.mock('./ResponseDefaultsConnector', () => ({ ResponseDefaultsConnector: () => null }));
vi.mock('./TemplateImportConnector', () => ({
  TemplateImportConnector: ({
    open,
    onTemplateSelected,
  }: {
    open: boolean;
    onTemplateSelected: (values: Record<string, unknown>) => void;
  }) => {
    mocks.pick = onTemplateSelected;
    return open ? <div data-testid="template-picker" /> : null;
  },
}));

const { CalloutFormConnector } = await import('./CalloutFormConnector');

const ui = () => <CalloutFormConnector open={true} onOpenChange={vi.fn()} mode="create" calloutsSetId="set-1" />;

const findTemplateButton = () => screen.getByRole('button', { name: 'forms.findTemplate' });

// File-scoped so both suites below start from the same mock state.
beforeEach(() => {
  mocks.spaceCanUpdate = false;
  mocks.subspaceId = '';
  mocks.subspaceCanUpdate = false;
  mocks.spaceLoading = false;
  mocks.subspaceLoading = false;
  mocks.parentSpaceId = undefined;
  mocks.entitlements = [];
  mocks.pick = undefined;
  mocks.handleCreateCallout.mockReset();
});

describe('CalloutFormConnector — manual template pick waits for the permission contexts', () => {
  test('Find Template cannot be opened while the permissions are loading', () => {
    mocks.spaceLoading = true;
    render(ui());

    expect(findTemplateButton()).toBeDisabled();
    fireEvent.click(findTemplateButton());
    expect(screen.queryByTestId('template-picker')).not.toBeInTheDocument();
  });

  test('on a subspace page it also waits for the subspace permissions', () => {
    mocks.parentSpaceId = 'space-1';
    mocks.subspaceLoading = true;
    render(ui());

    expect(findTemplateButton()).toBeDisabled();
  });

  test('an admin who opens the picker once permissions loaded keeps a picked Form template', () => {
    mocks.spaceLoading = true;
    const { rerender } = render(ui());
    expect(findTemplateButton()).toBeDisabled();

    mocks.spaceLoading = false;
    mocks.spaceCanUpdate = true;
    rerender(ui());
    expect(findTemplateButton()).toBeEnabled();
    fireEvent.click(findTemplateButton());
    expect(screen.getByTestId('template-picker')).toBeInTheDocument();

    act(() => mocks.pick?.({ framingChip: 'form', title: 'From template' }));

    expect(screen.getByRole('radio', { name: 'callout.form' })).toBeChecked();
  });

  test('a non-admin is still clamped to None once permissions have loaded', () => {
    render(ui());
    fireEvent.click(findTemplateButton());

    act(() => mocks.pick?.({ framingChip: 'form', title: 'From template' }));

    expect(screen.getByDisplayValue('From template')).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'callout.form' })).not.toBeInTheDocument();
  });
});

/**
 * An applied Callout template carries the id of its Collabora document in
 * `editMeta.collaboraDocumentId`, which the create mapper turns into
 * `sourceCollaboraDocumentID` — a byte copy of the template's document. That id has no
 * control of its own on screen, so abandoning the document framing has to drop it;
 * otherwise it outlives the only visible trace of the template and silently copies the
 * template's content into a document the author believes they created blank.
 */
describe('CalloutFormConnector — a template-carried Collabora source dies with the framing', () => {
  beforeEach(() => {
    mocks.entitlements = [LicenseEntitlementType.SpaceFlagOfficeDocuments];
  });

  const applyDocumentTemplate = () => {
    render(ui());
    fireEvent.click(findTemplateButton());
    act(() =>
      mocks.pick?.({
        framingChip: 'document',
        title: 'From template',
        editMeta: { framingProfileId: 'fp-1', originalReferenceIds: [], collaboraDocumentId: 'doc-T' },
      })
    );
  };

  const documentChip = () => screen.getByRole('radio', { name: 'callout.document' });

  const publishedFraming = async () => {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'forms.publish' }));
    });
    return mocks.handleCreateCallout.mock.calls[0][0].framing;
  };

  test('publishing straight after the pick copies the template document', async () => {
    applyDocumentTemplate();

    expect((await publishedFraming()).collaboraDocument).toEqual({ sourceCollaboraDocumentID: 'doc-T' });
  });

  test('leaving the document framing and returning to it creates a blank document, not a copy', async () => {
    applyDocumentTemplate();
    fireEvent.click(documentChip()); // deselect → 'none'
    fireEvent.click(documentChip()); // back to 'document', now without a source

    expect((await publishedFraming()).collaboraDocument).toEqual({
      displayName: 'From template',
      documentType: CollaboraDocumentType.Wordprocessing,
    });
  });
});
