/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  createTemplate: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useCreateTemplateFromSpaceMutation: () => [vi.fn()],
  useCreateTemplateMutation: () => [harness.createTemplate],
  useCreateWhiteboardDraftOnCalloutsSetMutation: () => [vi.fn()],
  useCreateWhiteboardDraftOnTemplatesSetMutation: () => [vi.fn()],
  useDeleteWhiteboardDraftMutation: () => [vi.fn()],
  useDeleteTemplateMutation: () => [vi.fn()],
  useDeleteReferenceMutation: () => [vi.fn()],
  useSpaceTemplateContentLazyQuery: () => [vi.fn()],
  useUpdateCalloutTemplateMutation: () => [vi.fn()],
  useUpdateCommunityGuidelinesMutation: () => [vi.fn()],
  useUpdateTemplateFromSpaceMutation: () => [vi.fn()],
  useUpdateTemplateMutation: () => [vi.fn()],
  useUrlResolverLazyQuery: () => [vi.fn()],
}));

vi.mock('@/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals', () => ({
  default: () => ({ uploadMediaGalleryVisuals: vi.fn() }),
}));

vi.mock('@/domain/collaboration/whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals', () => ({
  default: () => ({ uploadVisuals: vi.fn() }),
}));

// The Poll/Form side-saves are covered by their own tests.
vi.mock('@/main/crdPages/templates/useCalloutTemplateFramingSave', () => ({
  useCalloutTemplateFramingSave: () => ({ saveFormDefinition: vi.fn(), savePollOptions: vi.fn() }),
}));

vi.mock('@/main/crdPages/templates/CalloutTemplateForm', () => ({
  CalloutTemplateForm: () => null,
}));

import type { CalloutFormValues } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { useTemplateForms } from '../useTemplateForms';

const stagedFile = new File([new Uint8Array(4)], 'plan.docx', {
  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
});

function Harness({ body }: { body: Partial<CalloutFormValues> }) {
  const forms = useTemplateForms({ templatesSetId: 'templates-set-1' });
  return (
    <>
      <button
        type="button"
        onClick={() =>
          forms.openCreateCallout({
            common: { name: 'Doc template', description: 'A reusable document' },
            body: { title: 'Doc template', ...body },
          })
        }
      >
        Open create
      </button>
      <button type="button" onClick={forms.onSubmit}>
        Submit
      </button>
    </>
  );
}

const createAndSubmit = async (body: Partial<CalloutFormValues>) => {
  render(<Harness body={body} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open create' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(harness.createTemplate).toHaveBeenCalledOnce());
  return harness.createTemplate.mock.calls[0]?.[0]?.variables;
};

describe('useTemplateForms — staged Collabora file on callout-template create', () => {
  beforeEach(() => {
    harness.createTemplate.mockReset();
    harness.createTemplate.mockResolvedValue({
      data: { createTemplate: { id: 'template-1', callout: { framing: {} } } },
    });
  });

  it('sends the staged file with the create mutation', async () => {
    const variables = await createAndSubmit({ framingChip: 'document', collaboraUploadFile: stagedFile });
    expect(variables.file).toBe(stagedFile);
  });

  it('sends no file once the framing chip has been switched away from Document (FR-019 gate)', async () => {
    const variables = await createAndSubmit({ framingChip: 'none', collaboraUploadFile: stagedFile });
    expect(variables.file).toBeUndefined();
  });

  it('sends no file when nothing is staged', async () => {
    const variables = await createAndSubmit({ framingChip: 'document' });
    expect(variables.file).toBeUndefined();
  });
});
