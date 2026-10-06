/**
 * The admin-only framing chips (Contributors, Subspaces, Form) must follow the
 * admin privilege of the level the callout is created on. On a subspace page the
 * space context is the level-zero space, so its UPDATE privilege cannot decide.
 */
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  handleCreateCallout: vi.fn(),
  spaceCanUpdate: false,
  subspaceId: '',
  subspaceCanUpdate: false,
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
    loading: false,
  }),
}));

vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({
    subspace: { id: mocks.subspaceId },
    permissions: { canUpdate: mocks.subspaceCanUpdate },
  }),
}));

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ spaceId: 'space-1' }),
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

const { CalloutFormConnector } = await import('./CalloutFormConnector');

const openCreate = () =>
  render(<CalloutFormConnector open={true} onOpenChange={vi.fn()} mode="create" calloutsSetId="set-1" />);

const hasChip = (labelKey: string) => screen.queryByRole('radio', { name: labelKey }) !== null;

describe('CalloutFormConnector — admin-only framing chips follow the current level', () => {
  beforeEach(() => {
    mocks.spaceCanUpdate = false;
    mocks.subspaceId = '';
    mocks.subspaceCanUpdate = false;
  });

  test('a subspace admin without level-zero admin rights sees the admin-only chips', () => {
    mocks.subspaceId = 'sub-1';
    mocks.subspaceCanUpdate = true;
    openCreate();

    expect(hasChip('callout.form')).toBe(true);
    expect(hasChip('callout.contributors')).toBe(true);
    expect(hasChip('callout.subspaces')).toBe(true);
  });

  test('a level-zero admin who is not a subspace admin does not see them on a subspace', () => {
    mocks.spaceCanUpdate = true;
    mocks.subspaceId = 'sub-1';
    mocks.subspaceCanUpdate = false;
    openCreate();

    expect(hasChip('callout.form')).toBe(false);
  });

  test('on the level-zero space the space privilege decides', () => {
    mocks.spaceCanUpdate = true;
    openCreate();
    expect(hasChip('callout.form')).toBe(true);
  });

  test('a non-admin sees none of them', () => {
    openCreate();
    expect(hasChip('callout.form')).toBe(false);
    expect(hasChip('callout.contributors')).toBe(false);
  });
});
