import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { CalloutContributionType, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import type { CalloutFormValues } from '../hooks/useCrdCalloutForm';

type CapturedModalProps = {
  blockedReason?: string;
  onOpenChange: (open: boolean) => void;
  title: { onChange: (value: string) => void };
  onSubmit: () => void;
  onSaveDraft?: () => void;
  moreOptionsSlot?: ReactNode;
  responsesZoneSlot?: ReactNode;
};

const harness = vi.hoisted(() => ({
  uploading: true,
  modal: undefined as CapturedModalProps | undefined,
  handleCreateCallout: vi.fn(),
  updateCallout: vi.fn(),
  renderSlots: false,
  onFileUpload: vi.fn(),
  onTemplateSelected: undefined as ((values: Partial<CalloutFormValues>) => void) | undefined,
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
  useReferenceFileUpload: () => ({
    onFileUpload: harness.onFileUpload,
    accept: '',
    canUpload: true,
    uploading: harness.uploading,
  }),
}));

vi.mock('@/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation', () => ({
  useCalloutCreation: () => ({ handleCreateCallout: harness.handleCreateCallout, loading: false }),
}));

vi.mock('@/domain/collaboration/whiteboard/WhiteboardDraft/useWhiteboardDraft', () => ({
  useWhiteboardDraft: () => ({
    loading: false,
    discard: vi.fn().mockResolvedValue(true),
    consumed: vi.fn(),
    handle: undefined,
  }),
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
    return harness.renderSlots ? (
      <>
        <section aria-label="responses">{props.responsesZoneSlot}</section>
        <section aria-label="more-options">{props.moreOptionsSlot}</section>
      </>
    ) : null;
  },
}));
vi.mock('./FramingEditorConnector', () => ({ FramingEditorConnector: () => null }));
vi.mock('./ResponseDefaultsConnector', () => ({ ResponseDefaultsConnector: () => null }));
vi.mock('./TemplateImportConnector', () => ({
  TemplateImportConnector: (props: { onTemplateSelected: (values: Partial<CalloutFormValues>) => void }) => {
    harness.onTemplateSelected = props.onTemplateSelected;
    return null;
  },
}));

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
    harness.renderSlots = false;
    harness.onFileUpload = vi.fn();
    harness.onTemplateSelected = undefined;
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

describe('CalloutFormConnector — replacing the content from a template', () => {
  const finishUploads: ((url: string) => void)[] = [];

  const pickTwoFiles = (region: HTMLElement) => {
    const fileInput = region.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'alpha.pdf'), new File(['y'], 'beta.pdf')] } });
    expect(harness.onFileUpload).toHaveBeenCalledTimes(2);
  };

  const finishAll = () =>
    act(async () => {
      for (const finish of finishUploads) finish('https://cdn/file');
    });

  beforeEach(async () => {
    finishUploads.length = 0;
    harness.renderSlots = true;
    harness.uploading = false;
    harness.onFileUpload = vi.fn(
      () =>
        new Promise<string>(resolve => {
          finishUploads.push(resolve);
        })
    );
    await renderCreate();
  });

  test('an upload still running for the replaced references does not land in the template content', async () => {
    const references = screen.getByRole('region', { name: 'more-options' });
    fireEvent.click(within(references).getByRole('button', { name: 'references.addRow' }));
    pickTwoFiles(references);

    await act(async () => harness.onTemplateSelected?.({ title: 'From template', referenceRows: [] }));
    await finishAll();

    expect(within(references).getByText('references.empty')).toBeInTheDocument();
    expect(within(references).queryByLabelText('references.uriLabel')).not.toBeInTheDocument();
  });

  test('an upload still running for the replaced pre-populated links does not land in the template content', async () => {
    const emptyLink = { title: '', url: '', description: '' };
    await act(async () => harness.onTemplateSelected?.({ responseType: 'link', prePopulateLinkRows: [emptyLink] }));
    const responses = screen.getByRole('region', { name: 'responses' });
    pickTwoFiles(responses);

    await act(async () => harness.onTemplateSelected?.({ responseType: 'link', prePopulateLinkRows: [] }));
    await finishAll();

    expect(within(responses).getByText('contributionSettings.prePopulate.empty')).toBeInTheDocument();
    expect(within(responses).queryByLabelText('contributionSettings.prePopulate.urlLabel')).not.toBeInTheDocument();
  });

  test('an upload settling after Discard, while the closing form is still mounted, leaves the form empty', async () => {
    const references = screen.getByRole('region', { name: 'more-options' });
    fireEvent.click(within(references).getByRole('button', { name: 'references.addRow' }));
    const fileInput = references.querySelector('input[type="file"]') as HTMLInputElement;
    const files = ['a', 'b', 'c', 'd', 'e'].map(name => new File(['x'], `${name}.pdf`));
    fireEvent.change(fileInput, { target: { files } });
    expect(harness.onFileUpload).toHaveBeenCalledTimes(3);

    await act(async () => harness.modal?.onOpenChange(false));
    fireEvent.click(screen.getByRole('button', { name: 'dialogs.discardChanges.confirm' }));
    await waitFor(() => expect(within(references).getByText('references.empty')).toBeInTheDocument());
    await finishAll();

    expect(within(references).getByText('references.empty')).toBeInTheDocument();
    expect(within(references).queryByLabelText('references.uriLabel')).not.toBeInTheDocument();
    expect(harness.onFileUpload).toHaveBeenCalledTimes(3);
  });
});
