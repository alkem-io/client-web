/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { createFormOption, createFormQuestion, DEFAULT_FORM_SETTINGS } from '@/crd/forms/callout/formValues';
import { FramingEditorConnector } from './FramingEditorConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const baseProps = {
  linkUrl: '',
  onLinkUrlChange: vi.fn(),
  linkDisplayName: '',
  onLinkDisplayNameChange: vi.fn(),
  pollQuestion: '',
  onPollQuestionChange: vi.fn(),
  pollOptions: [],
  onPollOptionsChange: vi.fn(),
  mediaGalleryVisuals: [],
  onMediaGalleryVisualsChange: vi.fn(),
  collaboraDocumentType: CollaboraDocumentType.Wordprocessing,
  onCollaboraDocumentTypeChange: vi.fn(),
};

describe('FramingEditorConnector — form framing', () => {
  it('renders the question builder bound to the form values', () => {
    render(
      <FramingEditorConnector
        {...baseProps}
        framingType="form"
        formQuestions={[createFormQuestion({ prompt: 'Your name' })]}
        formSettings={DEFAULT_FORM_SETTINGS}
      />
    );

    expect(screen.getByLabelText('formForm.promptLabel')).toHaveValue('Your name');
  });

  it('routes question edits and settings changes to the parent', async () => {
    const onFormQuestionsChange = vi.fn();
    const onFormSettingsChange = vi.fn();
    render(
      <FramingEditorConnector
        {...baseProps}
        framingType="form"
        formQuestions={[createFormQuestion({ prompt: '' })]}
        onFormQuestionsChange={onFormQuestionsChange}
        formSettings={DEFAULT_FORM_SETTINGS}
        onFormSettingsChange={onFormSettingsChange}
      />
    );

    await userEvent.type(screen.getByLabelText('formForm.promptLabel'), 'A');
    expect(onFormQuestionsChange).toHaveBeenCalled();
    expect(onFormQuestionsChange.mock.calls[0][0][0].prompt).toBe('A');

    await userEvent.click(screen.getByRole('button', { name: 'formForm.settingsButton' }));
    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.responseMode.MULTIPLE' }));
    expect(onFormSettingsChange).toHaveBeenCalledWith({ ...DEFAULT_FORM_SETTINGS, responseMode: 'MULTIPLE' });
  });

  it('applies the edit locks: type locked questions and the disabled widen option with its reason', async () => {
    render(
      <FramingEditorConnector
        {...baseProps}
        mode="edit"
        framingType="form"
        formQuestions={[
          createFormQuestion({
            id: 'q1',
            prompt: 'Pick',
            type: 'SINGLE_CHOICE',
            options: [createFormOption('A'), createFormOption('B')],
          }),
        ]}
        formSettings={DEFAULT_FORM_SETTINGS}
        formEditLocks={{ typeLockedQuestionIds: ['q1'], canWidenVisibility: false, canSwitchToSingle: true }}
      />
    );

    expect(screen.getByRole('combobox', { name: 'formForm.typeLabel' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'formForm.settingsButton' }));
    expect(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' })).toBeDisabled();
    expect(screen.getByText('formForm.settings.widenDisabled')).toBeInTheDocument();
  });
});
