/** @vitest-environment jsdom */
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import type { WhiteboardDraftLifecycle } from '@/domain/collaboration/whiteboard/WhiteboardDraft/useWhiteboardDraft';

const harness = vi.hoisted(() => ({
  responseDefaultsProps: undefined as
    | { whiteboardDraft?: WhiteboardDraftLifecycle; existingDefaultSourceCalloutId?: string }
    | undefined,
  saveEdit: undefined as (() => void) | undefined,
  consumed: vi.fn(),
  updateResult: { data: { updateCallout: { id: 'callout-1', framing: {} } } } as unknown,
  updateCallout: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// The edit-mode callout this form is prefilled from: a whiteboard-response callout
// that already stores a default whiteboard.
const editedCallout = {
  lookup: {
    callout: {
      id: 'callout-1',
      framing: {
        type: CalloutFramingType.None,
        profile: { id: 'profile-1', displayName: 'Call for whiteboards', description: '', tagsets: [], references: [] },
      },
      settings: {
        framing: { commentsEnabled: false },
        contribution: {
          enabled: true,
          allowedTypes: [CalloutContributionType.Whiteboard],
          canAddContributions: [],
          commentsEnabled: false,
        },
      },
      contributionDefaults: {
        defaultDisplayName: 'Default board',
        postDescription: null,
        whiteboardContentAvailable: true,
      },
    },
  },
};

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutContentQuery: () => ({ data: editedCallout, loading: false }),
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useDeleteReferenceMutation: () => [vi.fn()],
  useSubspacesInSpaceQuery: () => ({ data: undefined, loading: false, refetch: vi.fn() }),
  useTemplateContentLazyQuery: () => [vi.fn()],
  useUpdateCalloutContentMutation: () => [harness.updateCallout, { loading: false }],
  useUpdatePollStatusMutation: () => [vi.fn()],
}));

vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    space: { accountId: 'account-1', levelZeroSpaceId: 'space-0', about: { membership: {} } },
    entitlements: [],
    permissions: { canUpdate: true },
    loading: false,
  }),
}));

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({ default: () => ({ spaceId: 'space-1' }) }));

vi.mock('@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation', () => ({
  useCalloutCreation: () => ({ handleCreateCallout: vi.fn(), loading: false }),
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
vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  StorageConfigContextProvider: ({ children }: { children: React.ReactNode }) => children,
  useStorageConfigContext: () => ({}),
}));
vi.mock('@/main/crdPages/markdown/useMarkdownEditorIntegration', () => ({
  useMarkdownEditorIntegration: () => ({ onImageUpload: vi.fn(), iframeAllowedUrls: [], onError: vi.fn() }),
}));
vi.mock('@/main/crdPages/utils/useReferenceFileUpload', () => ({
  useReferenceFileUpload: () => ({ onFileUpload: vi.fn(), uploadAccept: '' }),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('../hooks/useCrdSpaceContributors', () => ({
  useCrdSpaceContributors: () => ({ defaultType: undefined, getCards: () => [] }),
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

// The form body is irrelevant here; capture the Save handler so the edit submit can
// be driven without rendering the whole modal.
vi.mock('@/crd/forms/callout/AddPostModal', () => ({
  AddPostModal: ({ onSubmit }: { onSubmit?: () => void }) => {
    harness.saveEdit = onSubmit;
    return null;
  },
}));
vi.mock('./FramingEditorConnector', () => ({ FramingEditorConnector: () => null }));
vi.mock('./TemplateImportConnector', () => ({ TemplateImportConnector: () => null }));
vi.mock('./ResponseDefaultsConnector', () => ({
  ResponseDefaultsConnector: (props: {
    whiteboardDraft?: WhiteboardDraftLifecycle;
    existingDefaultSourceCalloutId?: string;
  }) => {
    harness.responseDefaultsProps = props;
    return null;
  },
}));
vi.mock('@/domain/collaboration/whiteboard/WhiteboardDraft/useWhiteboardDraft', () => ({
  useWhiteboardDraft: ({ handle }: { handle?: { whiteboardID: string; sourceKey: string } }) => ({
    handle,
    loading: false,
    materialize: vi.fn(),
    discard: vi.fn().mockResolvedValue(true),
    consumed: harness.consumed,
  }),
}));

import { CalloutFormConnector } from './CalloutFormConnector';

describe('CalloutFormConnector response-default whiteboard draft', () => {
  beforeEach(() => {
    harness.responseDefaultsProps = undefined;
    harness.saveEdit = undefined;
    harness.consumed.mockReset();
    harness.updateCallout = vi.fn().mockResolvedValue(harness.updateResult);
  });

  const renderEdit = () =>
    render(
      <CalloutFormConnector
        open={true}
        onOpenChange={vi.fn()}
        mode="edit"
        calloutId="callout-1"
        calloutsSetId="callouts-set-1"
      />
    );

  it('offers the draft lifecycle when editing an existing callout', async () => {
    renderEdit();

    // Without a lifecycle the defaults dialog falls back to a block that only offers
    // Clear, so an existing default whiteboard can never be opened.
    await waitFor(() => expect(harness.responseDefaultsProps?.whiteboardDraft).toBeDefined());
    expect(harness.responseDefaultsProps?.existingDefaultSourceCalloutId).toBe('callout-1');
  });

  it('releases the draft handle once the update is durable', async () => {
    renderEdit();

    await waitFor(() => expect(harness.saveEdit).toBeDefined());
    await act(async () => harness.saveEdit?.());

    // The server consumed and deleted the draft as part of the update, so a retry of
    // any later step must not resubmit its id.
    await waitFor(() => expect(harness.consumed).toHaveBeenCalled());
  });

  it('does not seed a create-mode draft from any callout', async () => {
    render(<CalloutFormConnector open={true} onOpenChange={vi.fn()} calloutsSetId="callouts-set-1" />);

    await waitFor(() => expect(harness.responseDefaultsProps?.whiteboardDraft).toBeDefined());
    expect(harness.responseDefaultsProps?.existingDefaultSourceCalloutId).toBeUndefined();
  });
});
