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
vi.mock('@/main/crdPages/space/callout/FramingEditorConnector', () => ({
  FramingEditorConnector: ({
    framingType,
    cardVariant,
    onCardVariantChange,
  }: {
    framingType: string;
    cardVariant?: 'compact' | 'expanded';
    onCardVariantChange?: (next: 'compact' | 'expanded') => void;
  }) =>
    framingType === 'spaces' ? (
      <button
        type="button"
        aria-pressed={cardVariant === 'expanded'}
        onClick={() => onCardVariantChange?.(cardVariant === 'expanded' ? 'compact' : 'expanded')}
      >
        Expanded card
      </button>
    ) : null,
}));

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

  it('with the Subspaces chip, the "Expanded card" switch is functional (feature 076, FR-007) — unlike the inert Manual-selection switch, it is not this feature to fix (spec A-9)', () => {
    const setField = vi.fn();

    render(
      <CalloutTemplateForm
        editMode={true}
        form={
          {
            values: {
              title: 'Template',
              description: '',
              framingChip: 'spaces',
              cardVariant: 'compact',
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

    const toggle = screen.getByRole('button', { name: 'Expanded card' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);

    expect(setField).toHaveBeenCalledWith('cardVariant', 'expanded');
  });
});
