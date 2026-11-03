import { act, render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';

type CapturedModalProps = {
  blockedReason?: string;
  title: { onChange: (value: string) => void };
  onSubmit: () => void;
  onSaveDraft?: () => void;
};

const harness = vi.hoisted(() => ({
  uploading: true,
  modal: undefined as CapturedModalProps | undefined,
  handleCreateCallout: vi.fn(),
  updateCallout: vi.fn(),
}));

const editedCallout = {
  lookup: {
    callout: {
      id: 'callout-1',
      framing: {
        type: CalloutFramingType.None,
        profile: { id: 'profile-1', displayName: 'Existing post', description: '', tagsets: [], references: [] },
      },
      settings: {
        framing: { commentsEnabled: false },
        contribution: {
          enabled: true,
          allowedTypes: [CalloutContributionType.Post],
          canAddContributions: [],
          commentsEnabled: false,
        },
      },
      contributionDefaults: { defaultDisplayName: null, postDescription: null, whiteboardContentAvailable: false },
    },
  },
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutFormResponsesQuery: () => ({ data: undefined, refetch: vi.fn() }),
  useCalloutContentQuery: ({ skip }: { skip?: boolean }) => ({
    data: skip ? undefined : editedCallout,
    loading: false,
  }),
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useDeleteReferenceMutation: () => [vi.fn()],
  useTemplateContentLazyQuery: () => [vi.fn()],
  useUpdateCalloutContentMutation: () => [harness.updateCallout, { loading: false }],
  useUpdateCalloutFormMutation: () => [vi.fn()],
  useUpdatePollStatusMutation: () => [vi.fn()],
}));

vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    space: { about: { membership: { roleSetID: 'role-set-1' } } },
    entitlements: [],
    permissions: { canUpdate: true },
    loading: false,
  }),
}));

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({ default: () => ({ spaceId: 'space-1' }) }));

vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  StorageConfigContextProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useStorageConfigContext: () => ({ storageBucketId: 'bucket-1' }),
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

vi.mock('@/main/crdPages/markdown/useMarkdownEditorIntegration', () => ({
  useMarkdownEditorIntegration: () => ({ onImageUpload: vi.fn(), iframeAllowedUrls: [], onError: vi.fn() }),
}));

vi.mock('@/main/crdPages/utils/useReferenceFileUpload', () => ({
  useReferenceFileUpload: () => ({ onFileUpload: vi.fn(), accept: '', canUpload: true, uploading: harness.uploading }),
}));

vi.mock('@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation', () => ({
  useCalloutCreation: () => ({ handleCreateCallout: harness.handleCreateCallout, loading: false }),
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
  usePollOptionManagement: () => ({ runDiff: vi.fn() }),
}));

vi.mock('@/domain/collaboration/calloutContributions/collaboraDocument/useRenameCollaboraDocument', () => ({
  useRenameCollaboraDocument: () => ({ editing: false, save: vi.fn() }),
}));

vi.mock('./useAccountSpaceCandidates', () => ({
  useAccountSpaceCandidates: () => ({ candidates: [], loading: false, error: undefined, refetch: vi.fn() }),
}));

vi.mock('./useSelectionCandidates', async importOriginal => {
  const actual = await importOriginal<typeof import('./useSelectionCandidates')>();
  return {
    ...actual,
    useSelectionCandidates: () => ({ candidates: [], loading: false, resolveChips: () => [], refetch: vi.fn() }),
  };
});

vi.mock('../hooks/useCrdSpaceContributors', () => ({
  useCrdSpaceContributors: () => ({ defaultType: undefined, getCards: () => [] }),
}));

vi.mock('@/crd/forms/callout/AddPostModal', () => ({
  AddPostModal: (props: CapturedModalProps) => {
    harness.modal = props;
    return null;
  },
}));
vi.mock('./FramingEditorConnector', () => ({ FramingEditorConnector: () => null }));
vi.mock('./ResponseDefaultsConnector', () => ({ ResponseDefaultsConnector: () => null }));
vi.mock('./TemplateImportConnector', () => ({ TemplateImportConnector: () => null }));

const { CalloutFormConnector } = await import('./CalloutFormConnector');

const renderCreate = async () => {
  render(<CalloutFormConnector open={true} onOpenChange={vi.fn()} mode="create" calloutsSetId="set-1" />);
  await act(async () => harness.modal?.title.onChange('A valid title'));
};

const renderEdit = async () => {
  render(
    <CalloutFormConnector open={true} onOpenChange={vi.fn()} mode="edit" calloutId="callout-1" calloutsSetId="set-1" />
  );
  await waitFor(() => expect(harness.modal).toBeDefined());
};

describe('CalloutFormConnector — no save while reference files upload', () => {
  beforeEach(() => {
    harness.uploading = true;
    harness.modal = undefined;
    harness.handleCreateCallout.mockReset();
    harness.updateCallout = vi.fn().mockResolvedValue({ data: { updateCallout: { id: 'callout-1', framing: {} } } });
  });

  test('blocks the footer with the files-uploading reason', async () => {
    await renderCreate();
    expect(harness.modal?.blockedReason).toBe('filesUploading');
  });

  test('Publish creates nothing while files upload', async () => {
    await renderCreate();
    await act(async () => harness.modal?.onSubmit());
    expect(harness.handleCreateCallout).not.toHaveBeenCalled();
  });

  test('Save draft creates nothing while files upload', async () => {
    await renderCreate();
    await act(async () => harness.modal?.onSaveDraft?.());
    expect(harness.handleCreateCallout).not.toHaveBeenCalled();
  });

  test('Save updates nothing while files upload', async () => {
    await renderEdit();
    await act(async () => harness.modal?.onSubmit());
    expect(harness.updateCallout).not.toHaveBeenCalled();
  });

  test('once uploads settle, Publish creates and Save updates', async () => {
    harness.uploading = false;
    await renderCreate();
    expect(harness.modal?.blockedReason).toBeUndefined();
    await act(async () => harness.modal?.onSubmit());
    expect(harness.handleCreateCallout).toHaveBeenCalled();

    harness.modal = undefined;
    await renderEdit();
    await act(async () => harness.modal?.onSubmit());
    await waitFor(() => expect(harness.updateCallout).toHaveBeenCalled());
  });
});
