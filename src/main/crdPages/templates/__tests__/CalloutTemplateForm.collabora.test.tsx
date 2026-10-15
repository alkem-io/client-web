/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useWhiteboardDetailsByIdQuery: () => ({ data: undefined }),
}));

// Everything outside the framing editor is irrelevant here, and pulls Apollo in.
vi.mock('@/crd/forms/callout/AllowCommentsField', () => ({ AllowCommentsField: () => null }));
// Rendered as a real button so the chip-switch handler is genuinely exercised;
// the component itself is not under test here.
vi.mock('@/crd/forms/callout/FramingChipStrip', () => ({
  FramingChipStrip: ({ onChange }: { onChange: (chip: string) => void }) => (
    <button type="button" data-testid="chip-whiteboard" onClick={() => onChange('whiteboard')} />
  ),
}));
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

const renderDocumentForm = (editMode: boolean, setField = vi.fn(), stagedFile: File | null = null) => {
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
            collaboraUploadFile: stagedFile,
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
  it('offers the upload control in create mode and stages the chosen file', () => {
    const setField = renderDocumentForm(false);
    const file = new File([new Uint8Array(4)], 'plan.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    pickFile(file);

    expect(setField).toHaveBeenCalledWith('collaboraUploadFile', file);
  });

  it('stages nothing and shows an error when the file has an unsupported extension', () => {
    const setField = renderDocumentForm(false);

    pickFile(new File([new Uint8Array(4)], 'notes.txt', { type: 'text/plain' }));

    expect(setField).toHaveBeenCalledWith('collaboraUploadFile', null);
    expect(setField).not.toHaveBeenCalledWith('collaboraUploadFile', expect.any(File));
    expect(screen.getByRole('alert')).toHaveTextContent('callout.documentImportErrorUnsupported');
  });

  // CodeRabbit, PR #10429: the chip handler only set `framingChip`, so a file
  // staged before switching away from 'document' survived the round-trip and
  // `useTemplateForms` still submitted it. A created template cannot replace
  // its document bytes through this editor, so the wrong file is permanent.
  it('clears a staged file when the framing chip leaves document', () => {
    const setField = vi.fn();
    const staged = new File([new Uint8Array(4)], 'contract.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    renderDocumentForm(false, setField, staged);

    fireEvent.click(screen.getByTestId('chip-whiteboard'));

    expect(setField).toHaveBeenCalledWith('collaboraUploadFile', null);
    expect(setField).toHaveBeenCalledWith('framingChip', 'whiteboard');
  });

  it('renders no upload zone and no file input in edit mode (FR-014)', () => {
    renderDocumentForm(true);

    expect(document.querySelector('input[type="file"]')).toBeNull();
    expect(screen.queryByText('callout.documentImportHint')).not.toBeInTheDocument();
  });
});
