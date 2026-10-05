/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { createFormOption, createFormQuestion, DEFAULT_FORM_SETTINGS } from '@/crd/forms/callout/formValues';
import { FramingEditorConnector } from './FramingEditorConnector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

beforeAll(() => {
  // Radix Select needs these DOM APIs, which jsdom does not implement.
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

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

    expect(screen.getByLabelText('formForm.questionNumber')).toHaveValue('Your name');
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

    await userEvent.type(screen.getByLabelText('formForm.questionNumber'), 'A');
    expect(onFormQuestionsChange).toHaveBeenCalled();
    expect(onFormQuestionsChange.mock.calls[0][0][0].prompt).toBe('A');

    await userEvent.click(screen.getByRole('button', { name: 'formForm.settingsButton' }));
    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.responseMode.MULTIPLE' }));
    expect(onFormSettingsChange).toHaveBeenCalledWith({ ...DEFAULT_FORM_SETTINGS, responseMode: 'MULTIPLE' });
  });

  const editForm = (
    formEditContext: React.ComponentProps<typeof FramingEditorConnector>['formEditContext'],
    onFormSettingsChange = vi.fn()
  ) => {
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
        onFormSettingsChange={onFormSettingsChange}
        formEditContext={formEditContext}
      />
    );
    return onFormSettingsChange;
  };

  it('nothing is locked by existing responses: the type select and both visibility options stay enabled', async () => {
    editForm({ savedVisibility: 'ADMINS', canReadAll: true, responseCount: 3, spaceName: 'Garden' });

    expect(screen.getByRole('combobox', { name: 'formForm.typeLabel' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'formForm.settingsButton' }));
    expect(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' })).toBeEnabled();
    expect(screen.getByRole('radio', { name: 'formForm.settings.responseMode.SINGLE' })).toBeEnabled();
  });

  it('widening a Form with responses asks first, stating the count', async () => {
    const onFormSettingsChange = editForm({
      savedVisibility: 'ADMINS',
      canReadAll: true,
      responseCount: 3,
      spaceName: 'Garden',
    });

    await userEvent.click(screen.getByRole('button', { name: 'formForm.settingsButton' }));
    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' }));

    expect(screen.getByText('formForm.settings.widenConfirm.description')).toBeInTheDocument();
    expect(onFormSettingsChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'formForm.settings.widenConfirm.confirm' }));
    expect(onFormSettingsChange).toHaveBeenCalledWith({ ...DEFAULT_FORM_SETTINGS, visibility: 'MEMBERS' });
  });

  it('an editor who cannot read every response is asked without a count', async () => {
    editForm({ savedVisibility: 'ADMINS', canReadAll: false, responseCount: 0, spaceName: 'Garden' });

    await userEvent.click(screen.getByRole('button', { name: 'formForm.settingsButton' }));
    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' }));

    expect(screen.getByText('formForm.settings.widenConfirm.descriptionNoCount')).toBeInTheDocument();
  });

  it('a Form without responses widens without asking', async () => {
    const onFormSettingsChange = editForm({
      savedVisibility: 'ADMINS',
      canReadAll: true,
      responseCount: 0,
      spaceName: 'Garden',
    });

    await userEvent.click(screen.getByRole('button', { name: 'formForm.settingsButton' }));
    await userEvent.click(screen.getByRole('radio', { name: 'formForm.settings.visibility.MEMBERS' }));

    expect(screen.queryByText('formForm.settings.widenConfirm.title')).toBeNull();
    expect(onFormSettingsChange).toHaveBeenCalledWith({ ...DEFAULT_FORM_SETTINGS, visibility: 'MEMBERS' });
  });

  it('the type-change hint shows for a persisted question once the Form has responses', async () => {
    editForm({ savedVisibility: 'ADMINS', canReadAll: true, responseCount: 2, spaceName: 'Garden' });
    expect(screen.queryByText('formForm.typeChangeHint')).toBeNull();

    await userEvent.click(screen.getByRole('combobox', { name: 'formForm.typeLabel' }));
    await userEvent.click(await screen.findByRole('option', { name: 'formForm.type.LONG_TEXT' }));

    expect(screen.getByText('formForm.typeChangeHint')).toBeInTheDocument();
  });

  it('routes the title and description to the parent', async () => {
    const onFormTitleChange = vi.fn();
    const onFormDescriptionChange = vi.fn();
    render(
      <FramingEditorConnector
        {...baseProps}
        framingType="form"
        formQuestions={[createFormQuestion({ prompt: 'Q' })]}
        formSettings={DEFAULT_FORM_SETTINGS}
        onFormTitleChange={onFormTitleChange}
        onFormDescriptionChange={onFormDescriptionChange}
      />
    );

    await userEvent.type(screen.getByLabelText('formForm.title'), 'T');
    await userEvent.type(screen.getByLabelText('formForm.description'), 'D');
    expect(onFormTitleChange).toHaveBeenCalledWith('T');
    expect(onFormDescriptionChange).toHaveBeenCalledWith('D');
  });
});
