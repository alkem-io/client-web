/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useWhiteboardDetailsByIdQuery: () => ({ data: undefined }),
}));

vi.mock('@/crd/forms/callout/AllowCommentsField', () => ({ AllowCommentsField: () => null }));
vi.mock('@/crd/forms/callout/FramingChipStrip', () => ({ FramingChipStrip: () => null }));
vi.mock('@/crd/forms/callout/ResponseTypeChipStrip', () => ({ ResponseTypeChipStrip: () => null }));
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({ MarkdownEditor: () => null }));
vi.mock('@/crd/forms/references/ReferencesEditor', () => ({ ReferencesEditor: () => null }));
vi.mock('@/crd/forms/tags-input', () => ({ TagsInput: () => null }));
vi.mock('@/main/crdPages/space/callout/FramingEditorConnector', () => ({ FramingEditorConnector: () => null }));

vi.mock('@/crd/forms/callout/ResponsePanel', () => ({
  ResponsePanel: ({ onSetDefaults }: { onSetDefaults?: () => void }) => (
    <button type="button" onClick={onSetDefaults}>
      Set defaults
    </button>
  ),
}));

vi.mock('@/main/crdPages/space/callout/ResponseDefaultsConnector', () => ({
  ResponseDefaultsConnector: ({
    open,
    whiteboardDraft,
  }: {
    open: boolean;
    whiteboardDraft?: { whiteboardID: string };
  }) => (open ? <div data-testid="response-default-draft">{whiteboardDraft?.whiteboardID}</div> : null),
}));

import { CalloutTemplateForm } from '@/main/crdPages/templates/CalloutTemplateForm';

describe('CalloutTemplateForm', () => {
  it('keeps the response-default Whiteboard draft editable for an existing template', () => {
    const draft = {
      whiteboardID: 'draft-whiteboard',
      sourceKey: 'source-callout:existing-callout',
    };

    render(
      <CalloutTemplateForm
        editMode={true}
        form={
          {
            values: {
              title: 'Template',
              description: '',
              framingChip: 'none',
              responseType: 'whiteboard',
              contributionDefaults: {},
              contributorCollection: {},
              referenceRows: [],
              tags: [],
            },
            errors: {},
            setField: vi.fn(),
          } as never
        }
        defaultWhiteboardDraft={draft as never}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Set defaults' }));

    expect(screen.getByTestId('response-default-draft')).toHaveTextContent('draft-whiteboard');
  });
});
