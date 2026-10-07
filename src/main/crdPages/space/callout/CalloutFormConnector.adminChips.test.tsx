/**
 * The admin-only framing chips (Contributors, Subspaces, Form) must follow the
 * admin privilege of the level the callout is created on. On a subspace page the
 * space context is the level-zero space, so its UPDATE privilege cannot decide.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

/**
 * The framing chips the viewer is offered: the row's radios plus, when the strip
 * groups the rest behind "More", the menu's items. Admin-only chips normally sit
 * in the menu, so a row-only check would pass vacuously for a non-admin.
 */
const offeredChips = async (): Promise<string[]> => {
  const row = screen.queryAllByRole('radio').map(chip => chip.getAttribute('aria-label') ?? '');
  const more = screen.queryByRole('button', { name: 'forms.moreFramingTypes' });
  if (!more) return row;
  await userEvent.click(more);
  const menu = (await screen.findAllByRole('menuitem')).map(item => item.textContent ?? '');
  await userEvent.keyboard('{Escape}');
  return [...row, ...menu];
};

describe('CalloutFormConnector — admin-only framing chips follow the current level', () => {
  beforeEach(() => {
    mocks.spaceCanUpdate = false;
    mocks.subspaceId = '';
    mocks.subspaceCanUpdate = false;
  });

  test('a subspace admin without level-zero admin rights sees the admin-only chips', async () => {
    mocks.subspaceId = 'sub-1';
    mocks.subspaceCanUpdate = true;
    openCreate();

    const chips = await offeredChips();
    expect(chips).toContain('callout.form');
    expect(chips).toContain('callout.contributors');
    expect(chips).toContain('callout.subspaces');
  });

  test('a level-zero admin who is not a subspace admin does not see them on a subspace', async () => {
    mocks.spaceCanUpdate = true;
    mocks.subspaceId = 'sub-1';
    mocks.subspaceCanUpdate = false;
    openCreate();

    const chips = await offeredChips();
    expect(chips).toContain('callout.whiteboard');
    expect(chips).not.toContain('callout.form');
  });

  test('on the level-zero space the space privilege decides', async () => {
    mocks.spaceCanUpdate = true;
    openCreate();
    expect(await offeredChips()).toContain('callout.form');
  });

  test('a non-admin sees none of them', async () => {
    openCreate();
    const chips = await offeredChips();
    // Positive control: the menu is reachable and lists the non-admin chips.
    expect(chips).toContain('callout.poll');
    expect(chips).not.toContain('callout.form');
    expect(chips).not.toContain('callout.contributors');
  });
});
