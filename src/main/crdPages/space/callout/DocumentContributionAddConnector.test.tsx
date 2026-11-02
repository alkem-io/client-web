import { ApolloError } from '@apollo/client';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { DocumentContributionAddConnector } from './DocumentContributionAddConnector';

// ---- Mocks ----

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const importDocumentMock = vi.fn();
const createDocumentMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useImportCollaboraDocumentMutation: () => [importDocumentMock, { loading: false }],
  useCreateCollaboraDocumentOnCalloutMutation: () => [createDocumentMock, { loading: false }],
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

// The just-created editor pulls a contribution via Apollo — stub it out so the
// connector's own behaviour is what's under test, not the overlay's data layer.
vi.mock('./DocumentContributionConnector', () => ({
  DocumentContributionConnector: ({ contributionId }: { contributionId: string }) => (
    <div data-testid="document-editor">{contributionId}</div>
  ),
}));

const docx = (name: string, size = 1) =>
  new File(['x'.repeat(size)], name, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

const apolloErrorWithCode = (code: string) =>
  new ApolloError({ graphQLErrors: [new GraphQLError('failed', { extensions: { code } })] });

const stageOneFile = async (user: ReturnType<typeof userEvent.setup>, file: File) => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  await user.upload(fileInput, file);
};

const baseProps = {
  calloutId: 'callout-1',
  open: true,
  onOpenChange: vi.fn(),
} as const;

afterEach(() => {
  vi.clearAllMocks();
  importDocumentMock.mockReset();
  refetchQueriesMock.mockReset();
  refetchQueriesMock.mockResolvedValue([]);
});

refetchQueriesMock.mockResolvedValue([]);

describe('DocumentContributionAddConnector — create empty document (regression for #10135)', () => {
  test('renders the blank-create affordances (title + type cards) alongside the upload zone', () => {
    render(<DocumentContributionAddConnector {...baseProps} />);

    // Title field for the new document.
    expect(screen.getByLabelText('callout.documentNameLabel')).toBeInTheDocument();

    // Three blank-create document-type cards.
    expect(screen.getByRole('radio', { name: 'callout.documentText' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'callout.documentSpreadsheet' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'callout.documentPresentation' })).toBeInTheDocument();

    // The upload path is still offered (as an alternative), not the only option.
    expect(screen.getByText('callout.documentImportHint')).toBeInTheDocument();
  });

  test('creating with no file staged calls the blank-create mutation with the chosen title + type', async () => {
    const user = userEvent.setup();
    createDocumentMock.mockResolvedValue({ data: { createContributionOnCallout: { id: 'contribution-9' } } });

    render(<DocumentContributionAddConnector {...baseProps} />);

    const titleInput = screen.getByLabelText('callout.documentNameLabel');
    await user.clear(titleInput);
    await user.type(titleInput, 'Meeting notes');

    // Choose "Presentation" so the type actually differs from the default.
    await user.click(screen.getByRole('radio', { name: 'callout.documentPresentation' }));

    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));

    await waitFor(() => expect(createDocumentMock).toHaveBeenCalledTimes(1));
    expect(createDocumentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          calloutId: 'callout-1',
          collaboraDocument: { displayName: 'Meeting notes', documentType: 'PRESENTATION' },
        },
      })
    );
    // The upload mutation must NOT fire on the blank-create path.
    expect(importDocumentMock).not.toHaveBeenCalled();
  });

  test('defaults to a Text document with the fallback title when nothing is changed', async () => {
    const user = userEvent.setup();
    createDocumentMock.mockResolvedValue({ data: { createContributionOnCallout: { id: 'contribution-1' } } });

    render(<DocumentContributionAddConnector {...baseProps} />);
    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));

    await waitFor(() => expect(createDocumentMock).toHaveBeenCalledTimes(1));
    expect(createDocumentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          calloutId: 'callout-1',
          collaboraDocument: { displayName: 'callout.defaultDocumentName', documentType: 'WORDPROCESSING' },
        },
      })
    );
  });

  test('staging a file routes to the upload mutation instead of blank-create', async () => {
    const user = userEvent.setup();
    importDocumentMock.mockResolvedValue({ data: { importCollaboraDocument: { id: 'contribution-7' } } });

    render(<DocumentContributionAddConnector {...baseProps} />);

    // The dialog (and its file input) render into a Radix portal on document.body,
    // not the render container.
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'report.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));

    await waitFor(() => expect(importDocumentMock).toHaveBeenCalledTimes(1));
    expect(importDocumentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          file,
          uploadData: expect.objectContaining({ calloutID: 'callout-1' }),
        }),
      })
    );
    expect(createDocumentMock).not.toHaveBeenCalled();
  });

  test('a staged file with an empty title still uploads (server derives the name from the file)', async () => {
    const user = userEvent.setup();
    importDocumentMock.mockResolvedValue({ data: { importCollaboraDocument: { id: 'contribution-8' } } });

    render(<DocumentContributionAddConnector {...baseProps} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'report.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    await user.upload(fileInput, file);

    // The user clears the default title after staging a file — the Create button
    // must stay enabled, and the upload must omit `displayName` so the server
    // falls back to the uploaded file name.
    await user.clear(screen.getByLabelText('callout.documentNameLabel'));

    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));

    await waitFor(() => expect(importDocumentMock).toHaveBeenCalledTimes(1));
    expect(importDocumentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          file,
          uploadData: { calloutID: 'callout-1' },
        },
      })
    );
    expect(createDocumentMock).not.toHaveBeenCalled();
  });
});

describe('DocumentContributionAddConnector — one-file import outcomes', () => {
  test('a successful import opens the editor of the returned contribution', async () => {
    const user = userEvent.setup();
    importDocumentMock.mockResolvedValue({ data: { importCollaboraDocument: { id: 'contribution-42' } } });

    render(<DocumentContributionAddConnector {...baseProps} />);
    await stageOneFile(user, docx('report.docx'));
    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));

    expect(await screen.findByTestId('document-editor')).toHaveTextContent('contribution-42');
  });

  // The inline error these codes set is not rendered while the file stays staged (the import zone
  // shows the staged-file row instead), so what is observable is: no toast, no editor, still open.
  test.each([
    'FORMAT_NOT_SUPPORTED',
    'STORAGE_UPLOAD_FAILED',
  ])('%s raises no toast, opens no editor and keeps the dialog open', async code => {
    const user = userEvent.setup();
    importDocumentMock.mockRejectedValue(apolloErrorWithCode(code));

    render(<DocumentContributionAddConnector {...baseProps} />);
    await stageOneFile(user, docx('report.docx'));
    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));

    await waitFor(() => expect(importDocumentMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole('button', { name: 'dialogs.create' })).toBeEnabled());
    expect(notifyMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId('document-editor')).not.toBeInTheDocument();
    expect(baseProps.onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByText('report.docx')).toBeInTheDocument();
  });

  test('STORAGE_SERVICE_UNAVAILABLE notifies and keeps the dialog open', async () => {
    const user = userEvent.setup();
    importDocumentMock.mockRejectedValue(apolloErrorWithCode('STORAGE_SERVICE_UNAVAILABLE'));

    render(<DocumentContributionAddConnector {...baseProps} />);
    await stageOneFile(user, docx('report.docx'));
    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));

    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith('callout.documentImportErrorServiceUnavailable', 'error')
    );
    expect(screen.queryByTestId('document-editor')).not.toBeInTheDocument();
    expect(baseProps.onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

type Deferred = { file: File; resolve: (id: string) => void; reject: (error: unknown) => void };

/** Makes `importDocument` calls wait until the test settles them, and tracks how many run at once. */
const controlImports = () => {
  const calls: Deferred[] = [];
  let inFlight = 0;
  let maxInFlight = 0;
  importDocumentMock.mockImplementation(
    ({ variables }: { variables: { file: File } }) =>
      new Promise((resolve, reject) => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        calls.push({
          file: variables.file,
          resolve: id => {
            inFlight -= 1;
            resolve({ data: { importCollaboraDocument: { id } } });
          },
          reject: error => {
            inFlight -= 1;
            reject(error);
          },
        });
      })
  );
  return { calls, maxInFlight: () => maxInFlight };
};

const pickFiles = (files: File[]) => {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(fileInput, { target: { files } });
};

const settleAll = async (calls: Deferred[], count: number, outcome: (index: number) => 'ok' | Error) => {
  for (let i = 0; i < count; i += 1) {
    await waitFor(() => expect(calls.length).toBeGreaterThan(i));
    const result = outcome(i);
    await act(async () => {
      if (result === 'ok') calls[i].resolve(`contribution-${i + 1}`);
      else calls[i].reject(result);
    });
  }
};

const oversizedDocx = (name: string) => {
  const file = docx(name);
  Object.defineProperty(file, 'size', { value: 1024 * 1024 * 1024 });
  return file;
};

describe('DocumentContributionAddConnector — multi-file import', () => {
  test('several files replace the title and type cards with the staged list', () => {
    render(<DocumentContributionAddConnector {...baseProps} />);
    pickFiles([docx('a.docx'), docx('b.docx'), docx('c.docx')]);

    expect(screen.getByText('a.docx')).toBeInTheDocument();
    expect(screen.getByText('b.docx')).toBeInTheDocument();
    expect(screen.getByText('c.docx')).toBeInTheDocument();
    expect(screen.queryByLabelText('callout.documentNameLabel')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  test('a batch of five imports at most three at once, then refreshes once, closes and opens no editor', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const { calls, maxInFlight } = controlImports();
    const files = ['1', '2', '3', '4', '5'].map(n => docx(`doc-${n}.docx`));

    render(<DocumentContributionAddConnector {...baseProps} onCreated={onCreated} />);
    pickFiles(files);
    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));
    await settleAll(calls, 5, () => 'ok');

    await waitFor(() => expect(baseProps.onOpenChange).toHaveBeenCalledWith(false));
    expect(maxInFlight()).toBe(3);
    expect(importDocumentMock).toHaveBeenCalledTimes(5);
    files.forEach((file, i) => {
      const options = importDocumentMock.mock.calls[i][0];
      expect(options.variables).toEqual({ file, uploadData: { calloutID: 'callout-1' } });
      expect(options.context).toEqual({ skipGlobalErrorHandler: true });
      expect(options.refetchQueries).toBeUndefined();
    });
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(refetchQueriesMock).toHaveBeenCalledTimes(1);
    expect(refetchQueriesMock).toHaveBeenCalledWith({ include: ['CalloutDetails', 'CalloutContributions'] });
    expect(screen.queryByTestId('document-editor')).not.toBeInTheDocument();
  });

  test('a partial failure keeps the created documents, lists only the failed file and can retry it', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const { calls } = controlImports();

    render(<DocumentContributionAddConnector {...baseProps} onCreated={onCreated} />);
    pickFiles([docx('a.docx'), docx('b.docx'), docx('c.docx')]);
    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));
    await settleAll(calls, 3, i => (i === 1 ? new Error('server down') : 'ok'));

    await waitFor(() => expect(refetchQueriesMock).toHaveBeenCalledTimes(1));
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(baseProps.onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.queryByText('a.docx')).not.toBeInTheDocument();
    expect(screen.queryByText('c.docx')).not.toBeInTheDocument();
    expect(screen.getByText('b.docx')).toBeInTheDocument();
    expect(screen.getByText('callout.documentImportFailed')).toBeInTheDocument();
    expect(screen.queryByTestId('document-editor')).not.toBeInTheDocument();

    await waitFor(() => expect(screen.getByRole('button', { name: 'dialogs.create' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));
    await waitFor(() => expect(calls).toHaveLength(4));
    expect(calls[3].file.name).toBe('b.docx');
    expect(importDocumentMock.mock.calls[3][0].context).toEqual({ skipGlobalErrorHandler: true });
    await act(async () => calls[3].reject(new Error('still down')));
    await waitFor(() => expect(screen.getByRole('button', { name: 'dialogs.create' })).toBeEnabled());
    expect(screen.queryByTestId('document-editor')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'callout.documentImportRemoveFile' }));
    expect(screen.getByLabelText('callout.documentNameLabel')).toBeInTheDocument();
  });

  test('a rejected list refresh is caught', async () => {
    const user = userEvent.setup();
    refetchQueriesMock.mockRejectedValue(new Error('refresh failed'));
    const { calls } = controlImports();

    render(<DocumentContributionAddConnector {...baseProps} />);
    pickFiles([docx('a.docx'), docx('b.docx')]);
    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));
    await settleAll(calls, 2, () => 'ok');

    await waitFor(() => expect(baseProps.onOpenChange).toHaveBeenCalledWith(false));
  });

  test('26 files stage the first 25 and the notice names the 26th', () => {
    render(<DocumentContributionAddConnector {...baseProps} />);
    pickFiles(Array.from({ length: 26 }, (_, i) => docx(`doc-${i + 1}.docx`)));

    expect(screen.getAllByRole('button', { name: 'callout.documentImportRemoveFile' })).toHaveLength(25);
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('doc-26.docx');
    expect(notice).toHaveTextContent('fileSelection.reason.limit');
  });

  test('an unaccepted type and an oversized file are named while the valid file is staged', () => {
    render(<DocumentContributionAddConnector {...baseProps} />);
    pickFiles([new File(['x'], 'notes.txt'), oversizedDocx('huge.docx'), docx('fine.docx')]);

    expect(screen.getAllByRole('button', { name: 'callout.documentImportRemoveFile' })).toHaveLength(1);
    expect(screen.getByText('fine.docx')).toBeInTheDocument();
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('notes.txt');
    expect(notice).toHaveTextContent('fileSelection.reason.type');
    expect(notice).toHaveTextContent('huge.docx');
    expect(notice).toHaveTextContent('fileSelection.reason.size');
  });

  test('re-picking an all-rejected pair after dismissing the notice names them again', async () => {
    const user = userEvent.setup();
    const files = [oversizedDocx('huge-1.docx'), oversizedDocx('huge-2.docx')];
    render(<DocumentContributionAddConnector {...baseProps} />);
    const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(fileInput(), files);
    expect(screen.getByRole('status')).toHaveTextContent('huge-1.docx');
    await user.click(screen.getByRole('button', { name: 'fileSelection.dismiss' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await user.upload(fileInput(), files);
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('huge-1.docx');
    expect(notice).toHaveTextContent('huge-2.docx');
  });

  test.each([
    ['FORMAT_NOT_SUPPORTED', 'callout.documentImportErrorUnsupported'],
    ['STORAGE_UPLOAD_FAILED', 'callout.documentImportErrorTooLarge'],
    ['STORAGE_SERVICE_UNAVAILABLE', 'callout.documentImportErrorServiceUnavailable'],
  ])('a batch file rejected with %s is listed with %s and raises no toast', async (code, message) => {
    const user = userEvent.setup();
    const { calls } = controlImports();

    render(<DocumentContributionAddConnector {...baseProps} />);
    pickFiles([docx('a.docx'), docx('b.docx')]);
    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));
    await settleAll(calls, 2, i => (i === 0 ? apolloErrorWithCode(code) : 'ok'));

    await waitFor(() => expect(screen.getByText(message)).toBeInTheDocument());
    expect(screen.getByText('a.docx')).toBeInTheDocument();
    expect(screen.queryByText('b.docx')).not.toBeInTheDocument();
    expect(screen.queryByText('callout.documentImportFailed')).not.toBeInTheDocument();
    expect(notifyMock).not.toHaveBeenCalled();
  });

  test('a staged batch makes the dialog dirty, and reopening clears the batch and the notice', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DocumentContributionAddConnector {...baseProps} />);
    pickFiles([docx('a.docx'), docx('b.docx'), new File(['x'], 'notes.txt')]);

    await user.click(screen.getByRole('button', { name: 'dialogs.cancel' }));
    expect(baseProps.onOpenChange).not.toHaveBeenCalledWith(false);

    rerender(<DocumentContributionAddConnector {...baseProps} open={false} />);
    rerender(<DocumentContributionAddConnector {...baseProps} open={true} />);

    expect(screen.queryByText('a.docx')).not.toBeInTheDocument();
    expect(screen.queryByText('notes.txt')).not.toBeInTheDocument();
    expect(screen.getByLabelText('callout.documentNameLabel')).toBeInTheDocument();
  });

  test('a batch staged after the title was cleared enables Create and imports without displayName', async () => {
    const user = userEvent.setup();
    importDocumentMock.mockResolvedValue({ data: { importCollaboraDocument: { id: 'c' } } });
    const files = [docx('a.docx'), docx('b.docx')];

    render(<DocumentContributionAddConnector {...baseProps} />);
    await user.clear(screen.getByLabelText('callout.documentNameLabel'));
    pickFiles(files);

    const create = screen.getByRole('button', { name: 'dialogs.create' });
    expect(create).toBeEnabled();
    await user.click(create);

    await waitFor(() => expect(importDocumentMock).toHaveBeenCalledTimes(2));
    files.forEach((file, i) => {
      expect(importDocumentMock.mock.calls[i][0].variables).toEqual({ file, uploadData: { calloutID: 'callout-1' } });
    });
  });

  test('failed imports raise no toast, are each named once in the staged list, and no left-out notice', async () => {
    const user = userEvent.setup();
    const { calls } = controlImports();

    render(<DocumentContributionAddConnector {...baseProps} />);
    pickFiles([docx('a.docx'), docx('b.docx')]);
    await user.click(screen.getByRole('button', { name: 'dialogs.create' }));
    await settleAll(calls, 2, () => new Error('nope'));

    await waitFor(() => expect(screen.getAllByText('callout.documentImportFailed')).toHaveLength(2));
    expect(screen.getAllByText('a.docx')).toHaveLength(1);
    expect(screen.getAllByText('b.docx')).toHaveLength(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(notifyMock).not.toHaveBeenCalled();
    for (const [options] of importDocumentMock.mock.calls) {
      expect(options.context).toEqual({ skipGlobalErrorHandler: true });
    }
  });
});
