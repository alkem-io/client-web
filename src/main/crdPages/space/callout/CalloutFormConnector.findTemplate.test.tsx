/**
 * A manually picked template ("Find Template") is clamped to the framings the viewer is offered,
 * which depends on the admin privilege. The permission contexts default to `canUpdate: false` while
 * loading, so the picker must not be openable until they have loaded — otherwise an admin's Form
 * pick would be silently cleared to None.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
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

describe('CalloutFormConnector — manual template pick waits for the permission contexts', () => {
  beforeEach(() => {
    mocks.spaceCanUpdate = false;
    mocks.subspaceId = '';
    mocks.subspaceCanUpdate = false;
    mocks.spaceLoading = false;
    mocks.subspaceLoading = false;
    mocks.parentSpaceId = undefined;
    mocks.pick = undefined;
  });

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
