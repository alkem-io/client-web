/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  createTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  updateTemplate: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useCreateTemplateFromSpaceMutation: () => [vi.fn()],
  useCreateTemplateMutation: () => [harness.createTemplate],
  useDeleteTemplateMutation: () => [harness.deleteTemplate],
  useDeleteReferenceMutation: () => [vi.fn()],
  useSpaceTemplateContentLazyQuery: () => [vi.fn()],
  useUpdateCalloutTemplateMutation: () => [vi.fn()],
  useUpdateCommunityGuidelinesMutation: () => [vi.fn()],
  useUpdateTemplateFromSpaceMutation: () => [vi.fn()],
  useUpdateTemplateMutation: () => [harness.updateTemplate],
  useUrlResolverLazyQuery: () => [vi.fn()],
}));

vi.mock('@/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals', () => ({
  default: () => ({ uploadMediaGalleryVisuals: vi.fn() }),
}));

vi.mock('@/domain/collaboration/whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals', () => ({
  default: () => ({ uploadVisuals: vi.fn() }),
}));

vi.mock('@/main/crdPages/space/hooks/useCrdCalloutForm', () => ({
  EMPTY_CALLOUT_FORM_VALUES: {},
  useCrdCalloutForm: () => ({
    values: {},
    dirty: false,
    validate: () => ({}),
    reset: vi.fn(),
    prefill: vi.fn(),
  }),
}));

vi.mock('@/main/crdPages/templates/CalloutTemplateForm', () => ({
  CalloutTemplateForm: () => null,
}));

vi.mock('@/main/crdPages/templates/WhiteboardTemplateFormConnector', () => ({
  WhiteboardTemplateFormConnector: ({
    editableWhiteboardId,
    onMaterialize,
    disabled,
  }: {
    editableWhiteboardId?: string;
    onMaterialize?: () => Promise<boolean>;
    disabled?: boolean;
  }) => (
    <div>
      <span data-testid="editable-whiteboard-id">{editableWhiteboardId}</span>
      <button type="button" disabled={disabled || !onMaterialize} onClick={() => void onMaterialize?.()}>
        Materialize drawing
      </button>
    </div>
  ),
}));

import { useTemplateForms } from '../useTemplateForms';

function Harness() {
  const form = useTemplateForms({ templatesSetId: 'templates-set-1' });
  return (
    <>
      <button type="button" onClick={() => form.openCreate('whiteboard')}>
        Open create
      </button>
      <button
        type="button"
        onClick={() =>
          form.onCommonChange({ name: 'Architecture', description: 'Reusable drawing', tags: ['diagram'] })
        }
      >
        Enter valid metadata
      </button>
      <button type="button" onClick={form.onCancel}>
        Cancel form
      </button>
      <button type="button" onClick={form.onSubmit}>
        Submit form
      </button>
      <span data-testid="form-open">{String(form.open)}</span>
      {form.perTypeFormSlot}
    </>
  );
}

const openValidWhiteboardCreate = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Open create' }));
  fireEvent.click(screen.getByRole('button', { name: 'Enter valid metadata' }));
};

describe('useTemplateForms whiteboard materialization', () => {
  beforeEach(() => {
    harness.createTemplate.mockReset();
    harness.deleteTemplate.mockReset();
    harness.updateTemplate.mockReset();
    harness.deleteTemplate.mockResolvedValue({ data: { deleteTemplate: { id: 'template-draft-1' } } });
    harness.updateTemplate.mockResolvedValue({ data: { updateTemplate: { id: 'template-draft-1' } } });
  });

  it('creates the canonical template Whiteboard by id and never sends snapshot bytes through GraphQL', async () => {
    harness.createTemplate.mockResolvedValue({
      data: { createTemplate: { id: 'template-draft-1', whiteboard: { id: 'template-whiteboard-1' } } },
    });
    render(<Harness />);
    openValidWhiteboardCreate();

    fireEvent.click(screen.getByRole('button', { name: 'Materialize drawing' }));

    await waitFor(() => expect(harness.createTemplate).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(screen.getByTestId('editable-whiteboard-id')).toHaveTextContent('template-whiteboard-1')
    );
    const variables = harness.createTemplate.mock.calls[0]?.[0]?.variables;
    expect(variables.whiteboard).toEqual({
      sourceWhiteboardID: undefined,
      profile: { displayName: 'Architecture' },
    });
    expect(JSON.stringify(variables)).not.toContain('content');
  });

  it('cascades the materialized draft on Cancel', async () => {
    harness.createTemplate.mockResolvedValue({
      data: { createTemplate: { id: 'template-draft-1', whiteboard: { id: 'template-whiteboard-1' } } },
    });
    render(<Harness />);
    openValidWhiteboardCreate();
    fireEvent.click(screen.getByRole('button', { name: 'Materialize drawing' }));
    await waitFor(() =>
      expect(screen.getByTestId('editable-whiteboard-id')).toHaveTextContent('template-whiteboard-1')
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel form' }));

    await waitFor(() =>
      expect(harness.deleteTemplate).toHaveBeenCalledWith({ variables: { templateId: 'template-draft-1' } })
    );
    await waitFor(() => expect(screen.getByTestId('form-open')).toHaveTextContent('false'));
  });

  it('keeps the materialized template on Save and updates metadata instead of creating a duplicate', async () => {
    harness.createTemplate.mockResolvedValue({
      data: { createTemplate: { id: 'template-draft-1', whiteboard: { id: 'template-whiteboard-1' } } },
    });
    render(<Harness />);
    openValidWhiteboardCreate();
    fireEvent.click(screen.getByRole('button', { name: 'Materialize drawing' }));
    await waitFor(() =>
      expect(screen.getByTestId('editable-whiteboard-id')).toHaveTextContent('template-whiteboard-1')
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit form' }));

    await waitFor(() => expect(harness.updateTemplate).toHaveBeenCalledOnce());
    expect(harness.createTemplate).toHaveBeenCalledOnce();
    expect(harness.deleteTemplate).not.toHaveBeenCalled();
    expect(harness.updateTemplate.mock.calls[0]?.[0]?.variables).toEqual({
      templateId: 'template-draft-1',
      profile: { displayName: 'Architecture', description: 'Reusable drawing', tagsets: undefined },
      includeProfileVisuals: false,
    });
  });

  it('deletes a partially-created template when the mutation omits its Whiteboard', async () => {
    harness.createTemplate.mockResolvedValue({ data: { createTemplate: { id: 'template-draft-1' } } });
    render(<Harness />);
    openValidWhiteboardCreate();

    fireEvent.click(screen.getByRole('button', { name: 'Materialize drawing' }));

    await waitFor(() =>
      expect(harness.deleteTemplate).toHaveBeenCalledWith({ variables: { templateId: 'template-draft-1' } })
    );
    expect(screen.getByTestId('editable-whiteboard-id')).toHaveTextContent('');
  });

  it('never creates a duplicate while cleanup of a partial template is failing', async () => {
    harness.createTemplate.mockResolvedValue({ data: { createTemplate: { id: 'template-draft-1' } } });
    harness.deleteTemplate.mockRejectedValue(new Error('delete failed'));
    render(<Harness />);
    openValidWhiteboardCreate();

    fireEvent.click(screen.getByRole('button', { name: 'Materialize drawing' }));
    await waitFor(() => expect(harness.deleteTemplate).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: 'Materialize drawing' }));
    await waitFor(() => expect(harness.deleteTemplate).toHaveBeenCalledTimes(2));
    expect(harness.createTemplate).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Submit form' }));
    await waitFor(() => expect(harness.deleteTemplate).toHaveBeenCalledTimes(3));
    expect(harness.createTemplate).toHaveBeenCalledOnce();
    expect(harness.updateTemplate).not.toHaveBeenCalled();
  });
});
