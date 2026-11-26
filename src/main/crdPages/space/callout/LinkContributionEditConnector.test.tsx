import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { LinkContributionEditConnector } from './LinkContributionEditConnector';

vi.mock('react-i18next', () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }), Trans: () => null };
});

const updateLinkMock = vi.fn();
const deleteDocumentMock = vi.fn();
const uploadFileMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateLinkMutation: () => [updateLinkMock],
  useDeleteLinkMutation: () => [vi.fn()],
  useDeleteContributionMutation: () => [vi.fn()],
  useDeleteDocumentMutation: () => [deleteDocumentMock],
  // Honour `onCompleted` the way Apollo does, so either upload path sees its result.
  useUploadFileMutation: (options?: { onCompleted?: (data: unknown) => void }) => [
    async (args: unknown) => {
      const result = await uploadFileMock(args);
      options?.onCompleted?.(result.data);
      return result;
    },
    { loading: false },
  ],
}));

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notifyMock,
}));

vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  StorageConfigContextProvider: ({ children }: { children: React.ReactNode }) => children,
  useStorageConfigContext: () => ({
    storageBucketId: 'bucket-1',
    allowedMimeTypes: [],
    maxFileSize: 0,
    canUpload: true,
    temporaryLocation: false,
  }),
}));

vi.mock('./LinkTermsHelper', () => ({ LinkTermsHelper: () => null }));

const target = {
  contributionId: 'contribution-1',
  linkId: 'link-1',
  url: 'https://old',
  displayName: 'Old',
  description: '',
};

const renderConnector = () => {
  const onClose = vi.fn();
  render(<LinkContributionEditConnector calloutId="callout-1" target={target} onClose={onClose} />);
  return { onClose };
};

const replaceFile = async () => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  await act(async () => {
    fireEvent.change(input, { target: { files: [new File(['x'], 'new.pdf')] } });
  });
};

afterEach(() => {
  vi.clearAllMocks();
  uploadFileMock.mockReset();
});

describe('LinkContributionEditConnector — the client deletes no upload', () => {
  test('replacing the file and then cancelling sends no deleteDocument', async () => {
    const user = userEvent.setup();
    uploadFileMock.mockResolvedValue({ data: { uploadFileOnStorageBucket: { id: 'doc-1', url: 'https://cdn/new' } } });
    const { onClose } = renderConnector();

    await replaceFile();
    await waitFor(() => expect(screen.getByLabelText('callout.linkUrlLabel')).toHaveValue('https://cdn/new'));
    await user.click(screen.getByRole('button', { name: 'dialogs.cancel' }));
    await user.click(await screen.findByRole('button', { name: 'dialogs.discardChanges.confirm' }));

    expect(onClose).toHaveBeenCalled();
    expect(deleteDocumentMock).not.toHaveBeenCalled();
  });

  test('replacing the file and then saving sends today’s update and no deleteDocument', async () => {
    const user = userEvent.setup();
    uploadFileMock.mockResolvedValue({ data: { uploadFileOnStorageBucket: { id: 'doc-1', url: 'https://cdn/new' } } });
    updateLinkMock.mockResolvedValue({});
    renderConnector();

    await replaceFile();
    await waitFor(() => expect(screen.getByLabelText('callout.linkUrlLabel')).toHaveValue('https://cdn/new'));
    await user.click(screen.getByRole('button', { name: 'callout.linkSave' }));

    await waitFor(() => expect(updateLinkMock).toHaveBeenCalledTimes(1));
    expect(updateLinkMock).toHaveBeenCalledWith({
      variables: {
        input: { ID: 'link-1', uri: 'https://cdn/new', profile: { displayName: 'new.pdf', description: undefined } },
      },
    });
    expect(deleteDocumentMock).not.toHaveBeenCalled();
  });

  test('a failed upload raises no error notification of its own and uploads temporarily', async () => {
    uploadFileMock.mockRejectedValue(new Error('network'));
    renderConnector();

    await replaceFile();
    await waitFor(() => expect(uploadFileMock).toHaveBeenCalledTimes(1));

    expect(uploadFileMock.mock.calls[0][0].variables.uploadData.temporaryLocation).toBe(true);
    expect(notifyMock).not.toHaveBeenCalledWith(expect.anything(), 'error');
    expect(screen.getByLabelText('callout.linkUrlLabel')).toHaveValue('https://old');
  });
});
