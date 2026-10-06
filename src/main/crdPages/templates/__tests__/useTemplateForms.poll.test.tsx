/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  updateCalloutTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  updateCalloutForm: vi.fn(),
  addPollOption: vi.fn(),
  removePollOption: vi.fn(),
  updatePollOption: vi.fn(),
  reorderPollOptions: vi.fn(),
  notify: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAddPollOptionMutation: () => [harness.addPollOption, {}],
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useCreateTemplateFromSpaceMutation: () => [vi.fn()],
  useCreateTemplateMutation: () => [vi.fn()],
  useCreateWhiteboardDraftOnCalloutsSetMutation: () => [vi.fn()],
  useCreateWhiteboardDraftOnTemplatesSetMutation: () => [vi.fn()],
  useDeleteReferenceMutation: () => [vi.fn()],
  useDeleteTemplateMutation: () => [vi.fn()],
  useDeleteWhiteboardDraftMutation: () => [vi.fn()],
  useRemovePollOptionMutation: () => [harness.removePollOption, {}],
  useReorderPollOptionsMutation: () => [harness.reorderPollOptions, {}],
  useSpaceTemplateContentLazyQuery: () => [vi.fn()],
  useUpdateCalloutFormMutation: () => [harness.updateCalloutForm],
  useUpdateCalloutTemplateMutation: () => [harness.updateCalloutTemplate],
  useUpdateCommunityGuidelinesMutation: () => [vi.fn()],
  useUpdatePollOptionMutation: () => [harness.updatePollOption, {}],
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

// The editor stand-in edits the options as an admin would: renames "A", drops "B", appends "D" first.
vi.mock('@/main/crdPages/templates/CalloutTemplateForm', () => ({
  CalloutTemplateForm: ({ form }: { form: { setField: (k: string, v: unknown) => void } }) => (
    <button
      type="button"
      onClick={() => form.setField('pollOptions', [{ text: 'D' }, { id: 'o-a', text: 'A2' }, { id: 'o-c', text: 'C' }])}
    >
      Edit options
    </button>
  ),
}));

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
            { name: 'Vote', description: 'Vote template', tags: [] },
            {
              ...EMPTY_CALLOUT_FORM_VALUES,
              title: 'Vote',
              framingChip: 'poll',
              pollQuestion: 'Pick one',
              pollOptions: [
                { id: 'o-a', text: 'A' },
                { id: 'o-b', text: 'B' },
                { id: 'o-c', text: 'C' },
              ],
              editMeta: { framingProfileId: 'profile-1', originalReferenceIds: [], pollId: 'poll-1' },
            }
          )
        }
      >
        Open poll template
      </button>
      <span data-testid="dialog-open">{String(forms.open)}</span>
      {forms.perTypeFormSlot}
      <button type="button" onClick={forms.onSubmit}>
        Save
      </button>
    </>
  );
}

describe('useTemplateForms — editing a Poll template', () => {
  beforeEach(() => {
    for (const fn of Object.values(harness)) fn.mockReset();
    harness.updateTemplate.mockResolvedValue({ data: { updateTemplate: { id: 'template-1' } } });
    harness.updateCalloutTemplate.mockResolvedValue({ data: { updateCallout: { framing: {} } } });
    harness.addPollOption.mockResolvedValue({
      data: {
        addPollOption: {
          options: [{ id: 'o-a' }, { id: 'o-b' }, { id: 'o-c' }, { id: 'o-d' }],
        },
      },
    });
    harness.removePollOption.mockResolvedValue({});
    harness.updatePollOption.mockResolvedValue({});
    harness.reorderPollOptions.mockResolvedValue({});
  });

  it('saves added, removed, renamed and reordered options on the template poll', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open poll template' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit options' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(harness.reorderPollOptions).toHaveBeenCalledOnce());
    expect(harness.addPollOption).toHaveBeenCalledWith({ variables: { optionData: { pollID: 'poll-1', text: 'D' } } });
    expect(harness.removePollOption).toHaveBeenCalledWith({
      variables: { optionData: { pollID: 'poll-1', optionID: 'o-b' } },
    });
    expect(harness.updatePollOption).toHaveBeenCalledWith({
      variables: { optionData: { pollID: 'poll-1', optionID: 'o-a', text: 'A2' } },
    });
    expect(harness.reorderPollOptions).toHaveBeenCalledWith({
      variables: { optionData: { pollID: 'poll-1', optionIDs: ['o-d', 'o-a', 'o-c'] } },
    });
    // The callout update carries the poll title only; options travel through their own mutations.
    expect(harness.updateCalloutTemplate.mock.calls[0][0].variables.calloutData.framing.poll).toEqual({
      title: 'Pick one',
    });
    expect(harness.updateCalloutTemplate.mock.invocationCallOrder[0]).toBeLessThan(
      harness.addPollOption.mock.invocationCallOrder[0]
    );
  });

  it('sends no option mutation when the options are unchanged', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open poll template' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.getByTestId('dialog-open')).toHaveTextContent('false'));
    expect(harness.updateCalloutTemplate).toHaveBeenCalledOnce();
    expect(harness.addPollOption).not.toHaveBeenCalled();
    expect(harness.removePollOption).not.toHaveBeenCalled();
    expect(harness.updatePollOption).not.toHaveBeenCalled();
    expect(harness.reorderPollOptions).not.toHaveBeenCalled();
  });

  it('reports a failed option save and keeps the dialog open', async () => {
    harness.removePollOption.mockRejectedValue(new Error('nope'));
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open poll template' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit options' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(harness.notify).toHaveBeenCalledWith('callout.pollOptionsSaveFailed', 'error'));
    expect(screen.getByTestId('dialog-open')).toHaveTextContent('true');
  });
});
