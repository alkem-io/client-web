/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  updateCalloutTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  updateCalloutForm: vi.fn(),
  notify: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAddPollOptionMutation: () => [vi.fn(), {}],
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useCreateTemplateFromSpaceMutation: () => [vi.fn()],
  useCreateTemplateMutation: () => [vi.fn()],
  useCreateWhiteboardDraftOnCalloutsSetMutation: () => [vi.fn()],
  useCreateWhiteboardDraftOnTemplatesSetMutation: () => [vi.fn()],
  useDeleteReferenceMutation: () => [vi.fn()],
  useDeleteTemplateMutation: () => [vi.fn()],
  useDeleteWhiteboardDraftMutation: () => [vi.fn()],
  useRemovePollOptionMutation: () => [vi.fn(), {}],
  useReorderPollOptionsMutation: () => [vi.fn(), {}],
  useSpaceTemplateContentLazyQuery: () => [vi.fn()],
  useUpdateCalloutFormMutation: () => [harness.updateCalloutForm],
  useUpdateCalloutTemplateMutation: () => [harness.updateCalloutTemplate],
  useUpdateCommunityGuidelinesMutation: () => [vi.fn()],
  useUpdatePollOptionMutation: () => [vi.fn(), {}],
  useUpdateTemplateFromSpaceMutation: () => [vi.fn()],
  useUpdateTemplateMutation: () => [harness.updateTemplate],
  useUrlResolverLazyQuery: () => [vi.fn()],
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => harness.notify }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));

vi.mock('@/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals', () => ({
  default: () => ({ uploadMediaGalleryVisuals: vi.fn() }),
}));

vi.mock('@/domain/collaboration/whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals', () => ({
  default: () => ({ uploadVisuals: vi.fn() }),
}));

// The editor stand-in edits the first question's prompt, as an admin typing in the builder would.
vi.mock('@/main/crdPages/templates/CalloutTemplateForm', () => ({
  CalloutTemplateForm: ({
    form,
  }: {
    form: { values: { formQuestions: { prompt: string }[] }; setField: (k: string, v: unknown) => void };
  }) => (
    <button
      type="button"
      onClick={() =>
        form.setField(
          'formQuestions',
          form.values.formQuestions.map((q, i) => (i === 0 ? { ...q, prompt: 'Your full name' } : q))
        )
      }
    >
      Edit question
    </button>
  ),
}));

import { createFormQuestion, DEFAULT_FORM_SETTINGS } from '@/crd/forms/callout/formValues';
import { EMPTY_CALLOUT_FORM_VALUES } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { useTemplateForms } from '../useTemplateForms';

function Harness() {
  const forms = useTemplateForms({ templatesSetId: 'templates-set-1' });
  return (
    <>
      <button
        type="button"
        onClick={() =>
          forms.openEditCallout(
            'template-1',
            'callout-1',
            { name: 'Sign-up', description: 'Sign-up template', tags: [] },
            {
              ...EMPTY_CALLOUT_FORM_VALUES,
              title: 'Sign-up',
              framingChip: 'form',
              formTitle: 'Sign-up',
              formQuestions: [createFormQuestion({ id: 'q-1', prompt: 'Name', required: true })],
              formSettings: DEFAULT_FORM_SETTINGS,
              editMeta: { framingProfileId: 'profile-1', originalReferenceIds: [], formId: 'form-1' },
            }
          )
        }
      >
        Open form template
      </button>
      <span data-testid="dialog-open">{String(forms.open)}</span>
      {forms.perTypeFormSlot}
      <button type="button" onClick={forms.onSubmit}>
        Save
      </button>
    </>
  );
}

describe('useTemplateForms — editing a Form template', () => {
  beforeEach(() => {
    harness.updateCalloutTemplate.mockReset();
    harness.updateTemplate.mockReset();
    harness.updateCalloutForm.mockReset();
    harness.notify.mockReset();
    harness.updateTemplate.mockResolvedValue({ data: { updateTemplate: { id: 'template-1' } } });
    harness.updateCalloutTemplate.mockResolvedValue({ data: { updateCallout: { framing: {} } } });
    harness.updateCalloutForm.mockResolvedValue({ data: { updateCalloutForm: { id: 'form-1' } } });
  });

  it('saves a changed definition through updateCalloutForm before the template callout', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open form template' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit question' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(harness.updateCalloutTemplate).toHaveBeenCalledOnce());
    expect(harness.updateCalloutForm).toHaveBeenCalledOnce();
    const { formData } = harness.updateCalloutForm.mock.calls[0][0].variables;
    expect(formData.formID).toBe('form-1');
    expect(formData.questions).toEqual([
      expect.objectContaining({ id: 'q-1', prompt: 'Your full name', required: true }),
    ]);
    // An unchanged title is left out so a concurrent edit is not overwritten.
    expect('title' in formData).toBe(false);
    expect(harness.updateCalloutForm.mock.invocationCallOrder[0]).toBeLessThan(
      harness.updateCalloutTemplate.mock.invocationCallOrder[0]
    );
    // The definition never rides updateCallout.
    expect(harness.updateCalloutTemplate.mock.calls[0][0].variables.calloutData.framing.form).toBeUndefined();
  });

  it('does not call updateCalloutForm when the definition is unchanged', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open form template' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(harness.updateCalloutTemplate).toHaveBeenCalledOnce());
    expect(harness.updateCalloutForm).not.toHaveBeenCalled();
  });

  it('keeps the template untouched and shows the localized reason when the definition is rejected', async () => {
    harness.updateCalloutForm.mockRejectedValue(new Error('rejected'));
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open form template' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit question' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(harness.notify).toHaveBeenCalledWith('formForm.errors.saveFailed', 'error'));
    expect(harness.updateTemplate).not.toHaveBeenCalled();
    expect(harness.updateCalloutTemplate).not.toHaveBeenCalled();
    expect(screen.getByTestId('dialog-open')).toHaveTextContent('true');
  });
});
