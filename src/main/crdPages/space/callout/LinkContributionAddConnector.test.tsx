import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { LinkContributionDialog as LinkContributionDialogType } from '@/crd/components/contribution/LinkContributionDialog';
import { LinkContributionAddConnector } from './LinkContributionAddConnector';

vi.mock('react-i18next', () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }), Trans: () => null };
});

const createLinkMock = vi.fn();
const deleteDocumentMock = vi.fn();
const uploadFileMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateLinkOnCalloutMutation: () => [createLinkMock],
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

const refetchQueriesMock = vi.fn();
vi.mock('@apollo/client', async importOriginal => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useApolloClient: () => ({ refetchQueries: refetchQueriesMock }),
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

type DialogProps = ComponentProps<typeof LinkContributionDialogType> & { mode: 'create' };
let dialogProps: DialogProps | undefined;
vi.mock('@/crd/components/contribution/LinkContributionDialog', async importOriginal => {
  const actual = await importOriginal<typeof import('@/crd/components/contribution/LinkContributionDialog')>();
  return {
    ...actual,
    LinkContributionDialog: (props: DialogProps) => {
      dialogProps = props;
      return <actual.LinkContributionDialog {...props} />;
    },
  };
});

let uploadCount = 0;
const uploadSucceeds = () =>
  uploadFileMock.mockImplementation(async () => {
    uploadCount += 1;
    return { data: { uploadFileOnStorageBucket: { id: `doc-${uploadCount}`, url: `https://cdn/${uploadCount}` } } };
  });

const fileInputs = () => Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];
const pickOne = async (input: HTMLInputElement, name: string) => {
  await act(async () => {
    fireEvent.change(input, { target: { files: [new File(['x'], name)] } });
  });
};
const urlInputs = () => screen.getAllByLabelText('callout.linkUrlLabel') as HTMLInputElement[];

const renderConnector = () => {
  const onOpenChange = vi.fn();
  const onCreated = vi.fn();
  render(
    <LinkContributionAddConnector calloutId="callout-1" open={true} onOpenChange={onOpenChange} onCreated={onCreated} />
  );
  return { onOpenChange, onCreated };
};

const discard = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'dialogs.cancel' }));
  await user.click(await screen.findByRole('button', { name: 'dialogs.discardChanges.confirm' }));
};

const rows = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ url: `https://l/${i}`, displayName: `Link ${i}`, description: '' }));

// "Add another" scrolls the new row into view; jsdom has no layout.
Element.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  vi.clearAllMocks();
  uploadFileMock.mockReset();
  createLinkMock.mockReset();
  refetchQueriesMock.mockReset();
  dialogProps = undefined;
});

describe('LinkContributionAddConnector — the client deletes no upload', () => {
  test('removing a row that holds an upload sends no deleteDocument', async () => {
    const user = userEvent.setup();
    uploadSucceeds();
    renderConnector();

    await user.click(screen.getByRole('button', { name: 'callout.linkAddAnother' }));
    await pickOne(fileInputs()[1], 'second.pdf');
    await waitFor(() => expect(urlInputs()[1].value).toMatch(/^https:\/\/cdn\//));
    await user.click(screen.getAllByRole('button', { name: 'callout.linkRemoveRow' })[1]);

    expect(urlInputs()).toHaveLength(1);
    expect(deleteDocumentMock).not.toHaveBeenCalled();
  });

  test('replacing a row file by a second pick sends no deleteDocument', async () => {
    uploadSucceeds();
    renderConnector();

    await pickOne(fileInputs()[0], 'first.pdf');
    await waitFor(() => expect(urlInputs()[0].value).toMatch(/^https:\/\/cdn\//));
    const firstUrl = urlInputs()[0].value;
    await pickOne(fileInputs()[0], 'second.pdf');
    await waitFor(() => expect(urlInputs()[0].value).not.toBe(firstUrl));

    expect(deleteDocumentMock).not.toHaveBeenCalled();
  });

  test('cancelling after an upload sends no deleteDocument', async () => {
    const user = userEvent.setup();
    uploadSucceeds();
    const { onOpenChange } = renderConnector();

    await pickOne(fileInputs()[0], 'first.pdf');
    await waitFor(() => expect(urlInputs()[0].value).toMatch(/^https:\/\/cdn\//));
    await discard(user);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(deleteDocumentMock).not.toHaveBeenCalled();
  });

  test('a URL variant kept in one row and the upload removed in another sends no deleteDocument', async () => {
    const user = userEvent.setup();
    uploadSucceeds();
    renderConnector();

    await user.click(screen.getByRole('button', { name: 'callout.linkAddAnother' }));
    await pickOne(fileInputs()[1], 'shared.pdf');
    await waitFor(() => expect(urlInputs()[1].value).toMatch(/^https:\/\/cdn\//));
    const uploadedUrl = urlInputs()[1].value;
    await user.clear(urlInputs()[0]);
    await user.type(urlInputs()[0], `${uploadedUrl}#page=2`);
    await user.click(screen.getAllByRole('button', { name: 'callout.linkRemoveRow' })[1]);
    await discard(user);

    expect(deleteDocumentMock).not.toHaveBeenCalled();
  });

  test('a failed one-file upload raises no error notification of its own', async () => {
    uploadFileMock.mockRejectedValue(new Error('network'));
    renderConnector();

    await pickOne(fileInputs()[0], 'first.pdf');
    await waitFor(() => expect(uploadFileMock).toHaveBeenCalledTimes(1));

    expect(notifyMock).not.toHaveBeenCalledWith(expect.anything(), 'error');
    expect(urlInputs()[0]).toHaveValue('');
  });

  test('uploads go to the temporary location', async () => {
    uploadSucceeds();
    renderConnector();

    await pickOne(fileInputs()[0], 'first.pdf');
    await waitFor(() => expect(uploadFileMock).toHaveBeenCalledTimes(1));
    expect(uploadFileMock.mock.calls[0][0].variables.uploadData).toEqual({
      storageBucketId: 'bucket-1',
      temporaryLocation: true,
    });
  });
});

describe('LinkContributionAddConnector — creating the links', () => {
  test('one create per row with today’s variables and no refetch options', async () => {
    createLinkMock.mockResolvedValue({});
    refetchQueriesMock.mockResolvedValue([]);
    renderConnector();

    await act(async () => {
      await dialogProps?.onSubmit([
        { url: 'https://a', displayName: 'A', description: 'about a' },
        { url: 'https://b', displayName: 'B', description: '' },
      ]);
    });

    expect(createLinkMock).toHaveBeenCalledTimes(2);
    expect(createLinkMock.mock.calls[0][0]).toEqual({
      variables: {
        calloutId: 'callout-1',
        link: { uri: 'https://a', profile: { displayName: 'A', description: 'about a' } },
      },
    });
    expect(createLinkMock.mock.calls[1][0]).toEqual({
      variables: {
        calloutId: 'callout-1',
        link: { uri: 'https://b', profile: { displayName: 'B', description: undefined } },
      },
    });
  });

  test('the list refreshes once, after every row settled, then the dialog closes', async () => {
    const order: string[] = [];
    const settles: Array<() => void> = [];
    createLinkMock.mockImplementation(
      () =>
        new Promise(resolve => {
          settles.push(() => {
            order.push('created');
            resolve({});
          });
        })
    );
    refetchQueriesMock.mockImplementation(async () => {
      order.push('refresh');
      return [];
    });
    const { onOpenChange, onCreated } = renderConnector();
    onOpenChange.mockImplementation(() => order.push('close'));
    onCreated.mockImplementation(() => order.push('created-callback'));

    let submission: unknown;
    act(() => {
      submission = dialogProps?.onSubmit(rows(4));
    });
    await act(async () => settles[3]());
    expect(refetchQueriesMock).not.toHaveBeenCalled();
    await act(async () => {
      settles[0]();
      settles[2]();
    });
    expect(refetchQueriesMock).not.toHaveBeenCalled();
    await act(async () => {
      settles[1]();
      await submission;
    });

    expect(refetchQueriesMock).toHaveBeenCalledTimes(1);
    expect(refetchQueriesMock).toHaveBeenCalledWith({ include: ['CalloutDetails', 'CalloutContributions'] });
    expect(order).toEqual(['created', 'created', 'created', 'created', 'refresh', 'close', 'created-callback']);
  });

  test('a failed row still refreshes once, rejects, keeps the dialog open and skips onCreated', async () => {
    const failure = new Error('row 2 failed');
    createLinkMock.mockImplementation(({ variables }: { variables: { link: { uri: string } } }) =>
      variables.link.uri === 'https://l/1' ? Promise.reject(failure) : Promise.resolve({})
    );
    refetchQueriesMock.mockRejectedValue(new Error('refresh failed'));
    const { onOpenChange, onCreated } = renderConnector();

    await act(async () => {
      await expect(dialogProps?.onSubmit(rows(4))).rejects.toBe(failure);
    });

    expect(createLinkMock).toHaveBeenCalledTimes(4);
    expect(refetchQueriesMock).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(onCreated).not.toHaveBeenCalled();
  });
});
