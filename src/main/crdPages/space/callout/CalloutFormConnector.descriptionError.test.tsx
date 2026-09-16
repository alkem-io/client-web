/**
 * Regression cover for the silent-save defect reported on acceptance: with an
 * over-long callout description the Publish button stayed enabled, submit
 * aborted inside `validate()`, and nothing was rendered — `description` was the
 * only error key the form could produce that this connector never displayed.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { LONG_MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';

/**
 * `t` is stubbed to echo its key, so this is the key the description error
 * resolves to — the shared, count-free length message.
 */
const MAX_LENGTH_MESSAGE = 'crd-common:components.wysiwyg-editor.validation.maxLength';

const handleCreateCallout = vi.fn();

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
  useCalloutContentQuery: () => ({ data: undefined, loading: false }),
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useDeleteReferenceMutation: () => [vi.fn()],
  useSubspacesInSpaceQuery: () => ({ data: undefined, loading: false, refetch: vi.fn() }),
  useTemplateContentLazyQuery: () => [vi.fn()],
  useUpdateCalloutContentMutation: () => [vi.fn(), { loading: false }],
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
  useCalloutCreation: () => ({ handleCreateCallout, loading: false }),
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

const openForm = () => {
  render(<CalloutFormConnector open={true} onOpenChange={vi.fn()} mode="create" calloutsSetId="set-1" />);
  fireEvent.change(screen.getByLabelText('forms.titleLabel'), { target: { value: 'A valid title' } });
  return {
    typeDescription: (value: string) =>
      fireEvent.change(screen.getByLabelText('description-editor'), { target: { value } }),
    publish: () => fireEvent.click(screen.getByRole('button', { name: /forms\.publish/i })),
  };
};

describe('CalloutFormConnector — over-long description feedback', () => {
  beforeEach(() => {
    handleCreateCallout.mockClear();
  });

  test('renders the description error instead of failing silently', () => {
    const form = openForm();
    form.typeDescription('a'.repeat(LONG_MARKDOWN_TEXT_LENGTH + 1));
    form.publish();

    expect(screen.getByText(MAX_LENGTH_MESSAGE)).toBeInTheDocument();
    expect(handleCreateCallout).not.toHaveBeenCalled();
  });

  // The limit counts raw markdown, so the surfaced error must not quote a figure
  // the author has no way to check their own text against.
  test('the surfaced error quotes no character figure', () => {
    const form = openForm();
    form.typeDescription('a'.repeat(LONG_MARKDOWN_TEXT_LENGTH + 1));
    form.publish();

    expect(screen.getByText(MAX_LENGTH_MESSAGE).textContent).not.toMatch(/\d/);
  });

  test('announces the error so it is not missed on submit', () => {
    const form = openForm();
    form.typeDescription('a'.repeat(LONG_MARKDOWN_TEXT_LENGTH + 1));
    form.publish();

    expect(screen.getByText(MAX_LENGTH_MESSAGE)).toHaveAttribute('aria-live', 'polite');
  });

  test('a description under the limit submits without a description error', () => {
    const form = openForm();
    form.typeDescription('a'.repeat(20000));
    form.publish();

    expect(screen.queryByText(MAX_LENGTH_MESSAGE)).not.toBeInTheDocument();
    expect(handleCreateCallout).toHaveBeenCalled();
  });
});
