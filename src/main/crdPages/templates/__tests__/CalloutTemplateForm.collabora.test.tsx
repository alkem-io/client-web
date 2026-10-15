/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const spies = vi.hoisted(() => ({ validateCollaboraImportFile: vi.fn() }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useWhiteboardDetailsByIdQuery: () => ({ data: undefined }),
}));

// Keep the real validator's behaviour; observe the call (FR-013: the client pre-check runs
// before anything is staged).
vi.mock('@/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile', async () => {
  const actual = await vi.importActual<
    typeof import('@/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile')
  >('@/domain/collaboration/calloutContributions/collaboraDocument/validateCollaboraImportFile');
  spies.validateCollaboraImportFile.mockImplementation(actual.validateCollaboraImportFile);
  return { ...actual, validateCollaboraImportFile: spies.validateCollaboraImportFile };
});

// Everything outside the framing editor is irrelevant here, and pulls Apollo in.
vi.mock('@/crd/forms/callout/AllowCommentsField', () => ({ AllowCommentsField: () => null }));
vi.mock('@/crd/forms/callout/FramingChipStrip', () => ({ FramingChipStrip: () => null }));
vi.mock('@/crd/forms/callout/ResponseTypeChipStrip', () => ({ ResponseTypeChipStrip: () => null }));
vi.mock('@/crd/forms/callout/ResponsePanel', () => ({ ResponsePanel: () => null }));
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({ MarkdownEditor: () => null }));
vi.mock('@/crd/forms/references/ReferencesEditor', () => ({ ReferencesEditor: () => null }));
vi.mock('@/crd/forms/tags-input', () => ({ TagsInput: () => null }));
vi.mock('@/main/crdPages/space/callout/ResponseDefaultsConnector', () => ({
  ResponseDefaultsConnector: () => null,
}));

import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { CalloutTemplateForm } from '@/main/crdPages/templates/CalloutTemplateForm';

const renderDocumentForm = (editMode: boolean, setField = vi.fn()) => {
  render(
    <CalloutTemplateForm
      editMode={editMode}
      form={
        {
          values: {
            title: 'Doc template',
            description: '',
            framingChip: 'document',
            collaboraDocumentType: CollaboraDocumentType.Wordprocessing,
            collaboraUploadFile: null,
            responseType: 'none',
            contributionDefaults: {},
            contributorCollection: {},
            referenceRows: [],
            tags: [],
          },
          errors: {},
          setField,
        } as never
      }
    />
  );
  return setField;
};

const pickFile = (file: File) => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  // Assign directly rather than via `userEvent.upload`, which honours the `accept`
  // attribute and would never deliver the rejected-extension case to the validator.
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  fireEvent.change(input);
};

describe('CalloutTemplateForm — Collabora document upload', () => {
  beforeEach(() => {
    spies.validateCollaboraImportFile.mockClear();
  });

  it('offers the upload control in create mode and validates the chosen file', () => {
    const setField = renderDocumentForm(false);
    const file = new File([new Uint8Array(4)], 'plan.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    pickFile(file);

    expect(spies.validateCollaboraImportFile).toHaveBeenCalledWith([file]);
    expect(setField).toHaveBeenCalledWith('collaboraUploadFile', file);
  });

  it('stages nothing and shows an error when the file has an unsupported extension', () => {
    const setField = renderDocumentForm(false);

    pickFile(new File([new Uint8Array(4)], 'notes.txt', { type: 'text/plain' }));

    expect(setField).toHaveBeenCalledWith('collaboraUploadFile', null);
    expect(setField).not.toHaveBeenCalledWith('collaboraUploadFile', expect.any(File));
    expect(screen.getByRole('alert')).toHaveTextContent('callout.documentImportErrorUnsupported');
  });

  it('renders no upload zone and no file input in edit mode (FR-014)', () => {
    renderDocumentForm(true);

    expect(document.querySelector('input[type="file"]')).toBeNull();
    expect(screen.queryByText('callout.documentImportHint')).not.toBeInTheDocument();
  });
});
