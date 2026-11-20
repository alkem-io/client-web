/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const captured = vi.hoisted(() => ({
  chipStrip: undefined as Record<string, unknown> | undefined,
  framingEditor: undefined as Record<string, unknown> | undefined,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useWhiteboardDetailsByIdQuery: () => ({ data: undefined }),
}));

vi.mock('@/crd/forms/callout/AllowCommentsField', () => ({ AllowCommentsField: () => null }));
vi.mock('@/crd/forms/callout/FramingChipStrip', () => ({
  FramingChipStrip: (props: Record<string, unknown>) => {
    captured.chipStrip = props;
    return null;
  },
}));
vi.mock('@/crd/forms/callout/ResponseTypeChipStrip', () => ({ ResponseTypeChipStrip: () => null }));
vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({ MarkdownEditor: () => null }));
vi.mock('@/crd/forms/references/ReferencesEditor', () => ({ ReferencesEditor: () => null }));
vi.mock('@/crd/forms/tags-input', () => ({ TagsInput: () => null }));
vi.mock('@/main/crdPages/space/callout/FramingEditorConnector', () => ({
  FramingEditorConnector: (props: {
    framingType: string;
    cardVariant?: 'compact' | 'expanded';
    onCardVariantChange?: (next: 'compact' | 'expanded') => void;
  }) => {
    captured.framingEditor = props;
    const { framingType, cardVariant, onCardVariantChange } = props;
    return framingType === 'spaces' ? (
      <button
        type="button"
        aria-pressed={cardVariant === 'expanded'}
        onClick={() => onCardVariantChange?.(cardVariant === 'expanded' ? 'compact' : 'expanded')}
      >
        Expanded card
      </button>
    ) : null;
  },
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

  it('with the Subspaces chip, the "Expanded card" switch is functional — unlike the inert Manual-selection switch, fixing that is out of scope here', () => {
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

  const formTemplate = (setField = vi.fn(), errors: Record<string, string> = {}) =>
    ({
      values: {
        title: 'Sign-up',
        description: '',
        framingChip: 'form',
        responseType: 'none',
        contributionDefaults: {},
        contributorCollection: {},
        referenceRows: [],
        tags: [],
        formTitle: 'Sign-up',
        formDescription: 'Tell us',
        formQuestions: [{ key: 'q-1', id: 'q-1', prompt: 'Name', type: 'SHORT_TEXT', required: true, options: [] }],
        formSettings: { visibility: 'ADMINS', responseMode: 'SINGLE', state: 'OPEN', defaultCollapsed: false },
      },
      errors,
      setField,
    }) as never;

  it('offers the Poll and Form framings, and the Form kind stays fixed once the template exists', () => {
    render(<CalloutTemplateForm editMode={true} form={formTemplate()} />);

    expect(captured.chipStrip?.allowedChips).toEqual(expect.arrayContaining(['poll', 'form']));
    expect(captured.chipStrip?.fixedKindChips).toEqual(['form']);
    expect(captured.chipStrip?.editMode).toBe(true);
  });

  it('binds the Form builder to the form values, with errors and no response-aware edit context', () => {
    const setField = vi.fn();
    render(
      <CalloutTemplateForm
        editMode={true}
        form={formTemplate(setField, { 'formQuestions.0.prompt': 'Required', formTitle: 'Too long' })}
      />
    );

    const editor = captured.framingEditor as Record<string, unknown> & {
      onFormTitleChange: (v: string) => void;
      onFormDescriptionChange: (v: string) => void;
      onFormQuestionsChange: (v: unknown[]) => void;
      onFormSettingsChange: (v: unknown) => void;
    };
    expect(editor.framingType).toBe('form');
    expect(editor.formTitle).toBe('Sign-up');
    expect(editor.formDescription).toBe('Tell us');
    expect(editor.formQuestions).toHaveLength(1);
    expect(editor.formSettings).toEqual(expect.objectContaining({ visibility: 'ADMINS' }));
    expect(editor.formQuestionsErrors).toEqual({ '0.prompt': 'Required', title: 'Too long' });
    expect(editor.formEditContext).toBeUndefined();

    editor.onFormTitleChange('New title');
    editor.onFormDescriptionChange('New description');
    editor.onFormQuestionsChange([]);
    editor.onFormSettingsChange({ visibility: 'MEMBERS' });
    expect(setField).toHaveBeenCalledWith('formTitle', 'New title');
    expect(setField).toHaveBeenCalledWith('formDescription', 'New description');
    expect(setField).toHaveBeenCalledWith('formQuestions', []);
    expect(setField).toHaveBeenCalledWith('formSettings', { visibility: 'MEMBERS' });
  });
});
