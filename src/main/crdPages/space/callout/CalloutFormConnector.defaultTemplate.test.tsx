/**
 * The default-template auto-load clamps the template to the framings the viewer is offered, and
 * that depends on the admin privilege. It must therefore wait for the space / subspace permission
 * contexts to finish loading — their loading default is `canUpdate: false`, which would clear an
 * admin's default Form template to None for good.
 */
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  handleCreateCallout: vi.fn(),
  spaceCanUpdate: false,
  subspaceId: '',
  subspaceCanUpdate: false,
  spaceLoading: false,
  subspaceLoading: false,
  parentSpaceId: undefined as string | undefined,
  loadTemplate: vi.fn(),
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
  useSubspacesInSpaceQuery: () => ({ data: undefined, loading: false, refetch: vi.fn() }),
  useTemplateContentLazyQuery: () => [vi.fn()],
  useUpdateCalloutContentMutation: () => [vi.fn(), { loading: false }],
  useUpdateCalloutFormMutation: () => [vi.fn()],
  useUpdatePollStatusMutation: () => [vi.fn()],
}));

vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    space: { about: { membership: { roleSetID: 'role-set-1' } } },
    entitlements: [],
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
vi.mock('./TemplateImportConnector', () => ({ TemplateImportConnector: () => null }));

vi.mock('@/main/crdPages/templates/loadCalloutTemplateFormValues', () => ({
  loadCalloutTemplateFormValues: (...args: unknown[]) => mocks.loadTemplate(...args),
}));

const { CalloutFormConnector } = await import('./CalloutFormConnector');

const ui = () => (
  <CalloutFormConnector
    open={true}
    onOpenChange={vi.fn()}
    mode="create"
    calloutsSetId="set-1"
    defaultTemplateId="template-form"
  />
);

const hasChip = (labelKey: string) => screen.queryByRole('radio', { name: labelKey }) !== null;

describe('CalloutFormConnector — default template waits for the permission contexts', () => {
  beforeEach(() => {
    mocks.spaceCanUpdate = false;
    mocks.subspaceId = '';
    mocks.subspaceCanUpdate = false;
    mocks.spaceLoading = false;
    mocks.subspaceLoading = false;
    mocks.parentSpaceId = undefined;
    mocks.loadTemplate.mockReset();
    mocks.loadTemplate.mockResolvedValue({ framingChip: 'form', title: 'From template' });
  });

  test('an admin keeps the default Form template when permissions finish loading after the dialog opens', async () => {
    mocks.spaceLoading = true;
    mocks.spaceCanUpdate = false;
    const { rerender } = render(ui());
    // Nothing is loaded (let alone clamped) while the permissions are at their loading default.
    expect(mocks.loadTemplate).not.toHaveBeenCalled();

    mocks.spaceLoading = false;
    mocks.spaceCanUpdate = true;
    rerender(ui());

    await waitFor(() => expect(mocks.loadTemplate).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByRole('radio', { name: 'callout.form' })).toBeChecked());
  });

  test('a non-admin is still clamped to None once permissions have loaded', async () => {
    mocks.spaceLoading = true;
    const { rerender } = render(ui());
    expect(mocks.loadTemplate).not.toHaveBeenCalled();

    mocks.spaceLoading = false;
    rerender(ui());

    await waitFor(() => expect(mocks.loadTemplate).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByDisplayValue('From template')).toBeInTheDocument());
    expect(hasChip('callout.form')).toBe(false);
  });

  test('on a subspace page it also waits for the subspace permissions', async () => {
    mocks.parentSpaceId = 'space-1';
    mocks.subspaceLoading = true;
    mocks.spaceCanUpdate = true; // level-zero admin, not a subspace admin
    const { rerender } = render(ui());
    expect(mocks.loadTemplate).not.toHaveBeenCalled();

    mocks.subspaceId = 'sub-1';
    mocks.subspaceCanUpdate = true;
    mocks.subspaceLoading = false;
    rerender(ui());

    await waitFor(() => expect(mocks.loadTemplate).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByRole('radio', { name: 'callout.form' })).toBeChecked());
  });
});
