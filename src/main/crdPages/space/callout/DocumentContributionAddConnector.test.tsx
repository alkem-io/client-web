import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notifyMock,
}));

// The just-created editor pulls a contribution via Apollo — stub it out so the
// connector's own behaviour is what's under test, not the overlay's data layer.
vi.mock('./DocumentContributionConnector', () => ({
  DocumentContributionConnector: () => null,
}));

const baseProps = {
  calloutId: 'callout-1',
  open: true,
  onOpenChange: vi.fn(),
} as const;

afterEach(() => {
  vi.clearAllMocks();
});

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
