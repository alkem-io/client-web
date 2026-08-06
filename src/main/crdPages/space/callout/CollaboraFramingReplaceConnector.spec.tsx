/**
 * @vitest-environment jsdom
 *
 * workspace#014-officedocs-replace-file — tests for the Collabora framing
 * document replace flow (US2/US3). Covers client-side validation gating
 * (unsupported / oversized / different-type block the mutation), the
 * incoming-vs-current title review, cancel vs confirm, the `displayName` seam,
 * and server-side rejection surfacing.
 */
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ReplaceCollaboraDocumentDocument } from '@/core/apollo/generated/apollo-hooks';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import enJson from '@/crd/i18n/space/space.en.json';
import { CollaboraFramingReplaceConnector } from './CollaboraFramingReplaceConnector';

const DOC_ID = 'doc-123';
const CURRENT_TITLE = 'Quarterly plan';

const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['crd-space'],
    defaultNS: 'crd-space',
    resources: { en: { 'crd-space': enJson } },
    interpolation: { escapeValue: false },
  });
});

const makeFile = (name: string, sizeBytes = 1024): File => {
  const file = new File([new Uint8Array(1)], name, { type: 'application/octet-stream' });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
};

const renderConnector = (ui: ReactElement, mocks: MockedResponse[] = []) =>
  render(
    <GlobalStateProvider>
      <I18nextProvider i18n={i18n}>
        <MockedProvider mocks={mocks}>{ui}</MockedProvider>
      </I18nextProvider>
    </GlobalStateProvider>
  );

const fileInput = (): HTMLInputElement => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
  if (!input) throw new Error('file input not found');
  return input;
};

const stage = (file: File) => {
  fireEvent.change(fileInput(), { target: { files: [file] } });
};

describe('CollaboraFramingReplaceConnector', () => {
  it('shows the current title and, after staging a valid file, an editable title field prefilled with the file name', async () => {
    renderConnector(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={() => {}}
        collaboraDocumentId={DOC_ID}
        currentDocumentType={CollaboraDocumentType.Wordprocessing}
        currentTitle={CURRENT_TITLE}
      />
    );

    // Current title is always visible.
    expect(screen.getByText(CURRENT_TITLE)).toBeInTheDocument();

    stage(makeFile('Revised-plan.docx'));

    // Once staged, the editable title field appears prefilled with the file name
    // (the staged-file card shows the file itself, so its name isn't repeated).
    const titleField = (await screen.findByLabelText(
      enJson.callout.documentReplaceTitleFieldLabel
    )) as HTMLInputElement;
    expect(titleField.value).toBe('Revised-plan');
  });

  it('names the current document type and narrows the picker + hint to that type only (FR-006)', () => {
    renderConnector(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={() => {}}
        collaboraDocumentId={DOC_ID}
        currentDocumentType={CollaboraDocumentType.Presentation}
        currentTitle={CURRENT_TITLE}
      />
    );

    // Says what the current document is.
    expect(screen.getByText(enJson.callout.documentPresentation)).toBeInTheDocument();
    // File picker only accepts the current type's extension.
    expect(fileInput().getAttribute('accept')).toBe('.pptx');
    // Hint lists only that extension, not all three.
    const hint = enJson.callout.documentReplaceAccepts.replace('{{ext}}', '.pptx').replace('{{cap}}', '15');
    expect(screen.getByText(hint)).toBeInTheDocument();
  });

  // Current document is a Wordprocessing doc, so any non-matching pick (an
  // unsupported format OR a wrong-but-allowed OfficeDocs type) must name the
  // expected type: "Word Document (.docx)".
  const sameTypeExpected = enJson.callout.documentReplaceErrorSameType
    .replace('{{type}}', 'Word Document')
    .replace('{{ext}}', '.docx');

  it.each([
    ['unsupported extension', 'notes.pdf', 1024, sameTypeExpected],
    [
      'oversized file',
      'big.docx',
      16 * 1024 * 1024,
      enJson.callout.documentImportErrorTooLarge.replace('{{cap}}', '15'),
    ],
    ['different document type', 'budget.xlsx', 1024, sameTypeExpected],
  ])('blocks a %s with its message and does not call the mutation', async (_label, name, size, expectedMessage) => {
    const variableMatcher = vi.fn().mockReturnValue(true);
    const mocks: MockedResponse[] = [
      {
        request: { query: ReplaceCollaboraDocumentDocument },
        variableMatcher,
        result: { data: { replaceCollaboraDocument: { __typename: 'CollaboraDocument', id: DOC_ID } } },
      },
    ];

    renderConnector(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={() => {}}
        collaboraDocumentId={DOC_ID}
        currentDocumentType={CollaboraDocumentType.Wordprocessing}
        currentTitle={CURRENT_TITLE}
      />,
      mocks
    );

    stage(makeFile(name, size));

    expect(await screen.findByRole('alert')).toHaveTextContent(expectedMessage);

    // Confirm is disabled (no valid file staged) — and the mutation was never fired.
    const confirmButton = screen.getByRole('button', { name: enJson.callout.documentReplaceConfirm });
    expect(confirmButton).toBeDisabled();
    fireEvent.click(confirmButton);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(variableMatcher).not.toHaveBeenCalled();
  });

  it('cancel closes the dialog without calling the mutation', async () => {
    const onOpenChange = vi.fn();
    const variableMatcher = vi.fn().mockReturnValue(true);
    const mocks: MockedResponse[] = [
      {
        request: { query: ReplaceCollaboraDocumentDocument },
        variableMatcher,
        result: { data: { replaceCollaboraDocument: { __typename: 'CollaboraDocument', id: DOC_ID } } },
      },
    ];

    renderConnector(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={onOpenChange}
        collaboraDocumentId={DOC_ID}
        currentDocumentType={CollaboraDocumentType.Wordprocessing}
        currentTitle={CURRENT_TITLE}
      />,
      mocks
    );

    stage(makeFile('Revised-plan.docx'));
    await screen.findByLabelText(enJson.callout.documentReplaceTitleFieldLabel);

    fireEvent.click(screen.getByRole('button', { name: enJson.dialogs.cancel }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(variableMatcher).not.toHaveBeenCalled();
  });

  it('confirm fires the mutation with the edited title sent as displayName', async () => {
    let captured: Record<string, unknown> | undefined;
    const onOpenChange = vi.fn();
    const mocks: MockedResponse[] = [
      {
        request: { query: ReplaceCollaboraDocumentDocument },
        variableMatcher: variables => {
          captured = variables;
          return true;
        },
        result: { data: { replaceCollaboraDocument: { __typename: 'CollaboraDocument', id: DOC_ID } } },
      },
    ];

    renderConnector(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={onOpenChange}
        collaboraDocumentId={DOC_ID}
        currentDocumentType={CollaboraDocumentType.Wordprocessing}
        currentTitle={CURRENT_TITLE}
      />,
      mocks
    );

    stage(makeFile('Revised-plan.docx'));
    const titleField = (await screen.findByLabelText(
      enJson.callout.documentReplaceTitleFieldLabel
    )) as HTMLInputElement;
    fireEvent.change(titleField, { target: { value: 'My renamed plan' } });

    fireEvent.click(screen.getByRole('button', { name: enJson.callout.documentReplaceConfirm }));

    await waitFor(() => expect(captured).toBeDefined());
    const replaceData = captured?.replaceData as { ID: string; displayName?: string };
    expect(replaceData.ID).toBe(DOC_ID);
    expect(replaceData.displayName).toBe('My renamed plan');
    expect(captured?.file).toBeInstanceOf(File);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('surfaces a server-side rejection message (e.g. the active-edit block)', async () => {
    const lockMessage = 'This document is currently being edited. Please try again once no one is editing.';
    const mocks: MockedResponse[] = [
      {
        request: { query: ReplaceCollaboraDocumentDocument },
        variableMatcher: () => true,
        result: { errors: [new GraphQLError(lockMessage, { extensions: { code: 'BAD_USER_INPUT' } })] },
      },
    ];

    renderConnector(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={() => {}}
        collaboraDocumentId={DOC_ID}
        currentDocumentType={CollaboraDocumentType.Wordprocessing}
        currentTitle={CURRENT_TITLE}
      />,
      mocks
    );

    stage(makeFile('Revised-plan.docx'));
    await screen.findByLabelText(enJson.callout.documentReplaceTitleFieldLabel);
    fireEvent.click(screen.getByRole('button', { name: enJson.callout.documentReplaceConfirm }));

    expect(await screen.findByText(lockMessage)).toBeInTheDocument();
  });

  it('names PDF as the current document type and narrows the picker + hint to .pdf only (FR-004)', () => {
    renderConnector(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={() => {}}
        collaboraDocumentId={DOC_ID}
        currentDocumentType={CollaboraDocumentType.Pdf}
        currentTitle={CURRENT_TITLE}
      />
    );

    expect(screen.getByText(enJson.callout.documentPdf)).toBeInTheDocument();
    expect(fileInput().getAttribute('accept')).toBe('.pdf');
    const hint = enJson.callout.documentReplaceAccepts.replace('{{ext}}', '.pdf').replace('{{cap}}', '15');
    expect(screen.getByText(hint)).toBeInTheDocument();
  });

  it('replacing an existing PDF document with another PDF succeeds (US2)', async () => {
    let captured: Record<string, unknown> | undefined;
    const onOpenChange = vi.fn();
    const mocks: MockedResponse[] = [
      {
        request: { query: ReplaceCollaboraDocumentDocument },
        variableMatcher: variables => {
          captured = variables;
          return true;
        },
        result: { data: { replaceCollaboraDocument: { __typename: 'CollaboraDocument', id: DOC_ID } } },
      },
    ];

    renderConnector(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={onOpenChange}
        collaboraDocumentId={DOC_ID}
        currentDocumentType={CollaboraDocumentType.Pdf}
        currentTitle={CURRENT_TITLE}
      />,
      mocks
    );

    stage(makeFile('revised-report.pdf'));
    fireEvent.click(screen.getByRole('button', { name: enJson.callout.documentReplaceConfirm }));

    await waitFor(() => expect(captured).toBeDefined());
    expect(captured?.file).toBeInstanceOf(File);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('rejects replacing a PDF document with a non-PDF file, client-side, without calling the mutation (FR-004)', async () => {
    const variableMatcher = vi.fn().mockReturnValue(true);
    const mocks: MockedResponse[] = [
      {
        request: { query: ReplaceCollaboraDocumentDocument },
        variableMatcher,
        result: { data: { replaceCollaboraDocument: { __typename: 'CollaboraDocument', id: DOC_ID } } },
      },
    ];

    renderConnector(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={() => {}}
        collaboraDocumentId={DOC_ID}
        currentDocumentType={CollaboraDocumentType.Pdf}
        currentTitle={CURRENT_TITLE}
      />,
      mocks
    );

    stage(makeFile('revised-report.docx'));

    const expected = enJson.callout.documentReplaceErrorSameType
      .replace('{{type}}', enJson.callout.documentPdf)
      .replace('{{ext}}', '.pdf');
    expect(await screen.findByRole('alert')).toHaveTextContent(expected);

    const confirmButton = screen.getByRole('button', { name: enJson.callout.documentReplaceConfirm });
    expect(confirmButton).toBeDisabled();
    fireEvent.click(confirmButton);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(variableMatcher).not.toHaveBeenCalled();
  });

  it('surfaces a coded server rejection (FORMAT_NOT_SUPPORTED) while a file is staged, without dead-ending', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: ReplaceCollaboraDocumentDocument },
        variableMatcher: () => true,
        result: {
          errors: [
            new GraphQLError('unsupported', {
              extensions: { code: 'FORMAT_NOT_SUPPORTED' },
            }),
          ],
        },
      },
    ];

    renderConnector(
      <CollaboraFramingReplaceConnector
        open={true}
        onOpenChange={() => {}}
        collaboraDocumentId={DOC_ID}
        currentDocumentType={CollaboraDocumentType.Wordprocessing}
        currentTitle={CURRENT_TITLE}
      />,
      mocks
    );

    stage(makeFile('Revised-plan.docx'));
    await screen.findByLabelText(enJson.callout.documentReplaceTitleFieldLabel);
    fireEvent.click(screen.getByRole('button', { name: enJson.callout.documentReplaceConfirm }));

    // The mapped message renders in the dialog's always-visible alert — it must
    // NOT be routed to the import-zone surface (invisible while a file is staged),
    // which previously produced a silent dead-end with a greyed-out Confirm.
    const expected = enJson.callout.documentImportErrorUnsupported.replace('{{formats}}', '.docx, .xlsx, .pptx, .pdf');
    expect(await screen.findByText(expected)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: enJson.callout.documentReplaceConfirm })).not.toBeDisabled();
  });
});
