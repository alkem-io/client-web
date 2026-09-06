/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  updateCalloutTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  uploadMediaGalleryVisuals: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateReferenceOnProfileMutation: () => [vi.fn()],
  useCreateTemplateFromSpaceMutation: () => [vi.fn()],
  useCreateTemplateMutation: () => [vi.fn()],
  useCreateWhiteboardDraftOnCalloutsSetMutation: () => [vi.fn()],
  useCreateWhiteboardDraftOnTemplatesSetMutation: () => [vi.fn()],
  useDeleteWhiteboardDraftMutation: () => [vi.fn()],
  useDeleteTemplateMutation: () => [vi.fn()],
  useDeleteReferenceMutation: () => [vi.fn()],
  useSpaceTemplateContentLazyQuery: () => [vi.fn()],
  useUpdateCalloutTemplateMutation: () => [harness.updateCalloutTemplate],
  useUpdateCommunityGuidelinesMutation: () => [vi.fn()],
  useUpdateTemplateFromSpaceMutation: () => [vi.fn()],
  useUpdateTemplateMutation: () => [harness.updateTemplate],
  useUrlResolverLazyQuery: () => [vi.fn()],
}));

vi.mock('@/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals', () => ({
  default: () => ({ uploadMediaGalleryVisuals: harness.uploadMediaGalleryVisuals }),
}));

vi.mock('@/domain/collaboration/whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals', () => ({
  default: () => ({ uploadVisuals: vi.fn() }),
}));

vi.mock('@/main/crdPages/templates/CalloutTemplateForm', () => ({
  CalloutTemplateForm: () => null,
}));

import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { EMPTY_CALLOUT_FORM_VALUES } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { useTemplateForms } from '../useTemplateForms';

const existingVisual = {
  id: 'visual-1',
  uri: 'https://example.com/one.png',
  name: 'One',
  altText: 'One',
  visualType: VisualType.Card,
  sortOrder: 0,
};

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
            { name: 'Gallery', description: 'Gallery template', tags: [] },
            {
              ...EMPTY_CALLOUT_FORM_VALUES,
              title: 'Gallery',
              description: 'Gallery template',
              framingChip: 'image',
              mediaGalleryVisuals: [existingVisual],
              editMeta: {
                framingProfileId: 'profile-1',
                originalReferenceIds: [],
                mediaGalleryId: 'gallery-1',
                originalMediaGalleryVisualIds: ['visual-1', 'visual-removed'],
                originalMediaGallerySortOrders: { 'visual-1': 1, 'visual-removed': 0 },
              },
            }
          )
        }
      >
        Open gallery edit
      </button>
      <button
        type="button"
        onClick={() =>
          forms.openEditCallout(
            'template-1',
            'callout-1',
            { name: 'Gallery', description: 'Gallery template', tags: [] },
            {
              ...EMPTY_CALLOUT_FORM_VALUES,
              title: 'Gallery',
              description: 'Gallery template',
              framingChip: 'image',
              mediaGalleryVisuals: [],
              editMeta: {
                framingProfileId: 'profile-1',
                originalReferenceIds: [],
                mediaGalleryId: 'gallery-1',
                originalMediaGalleryVisualIds: ['visual-1', 'visual-removed'],
                originalMediaGallerySortOrders: { 'visual-1': 1, 'visual-removed': 0 },
              },
            }
          )
        }
      >
        Open empty gallery edit
      </button>
      <button type="button" onClick={forms.onSubmit}>
        Save gallery edit
      </button>
    </>
  );
}

describe('useTemplateForms media-gallery editing', () => {
  beforeEach(() => {
    harness.updateCalloutTemplate.mockReset();
    harness.updateTemplate.mockReset();
    harness.uploadMediaGalleryVisuals.mockReset();
    harness.updateTemplate.mockResolvedValue({ data: { updateTemplate: { id: 'template-1' } } });
    harness.updateCalloutTemplate.mockResolvedValue({
      data: { updateCallout: { framing: { whiteboard: undefined } } },
    });
    harness.uploadMediaGalleryVisuals.mockResolvedValue(undefined);
  });

  it('diffs the edited gallery against its original visuals after updating the callout', async () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Open gallery edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save gallery edit' }));

    await waitFor(() => expect(harness.updateCalloutTemplate).toHaveBeenCalledOnce());
    expect(harness.uploadMediaGalleryVisuals).toHaveBeenCalledWith({
      mediaGalleryId: 'gallery-1',
      visuals: [existingVisual],
      existingVisualIds: ['visual-1', 'visual-removed'],
      originalSortOrders: { 'visual-1': 1, 'visual-removed': 0 },
    });
  });

  it('passes an empty gallery through so all original visuals are deleted', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Open empty gallery edit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save gallery edit' }));

    await waitFor(() => expect(harness.uploadMediaGalleryVisuals).toHaveBeenCalledOnce());
    expect(harness.uploadMediaGalleryVisuals).toHaveBeenCalledWith({
      mediaGalleryId: 'gallery-1',
      visuals: [],
      existingVisualIds: ['visual-1', 'visual-removed'],
      originalSortOrders: { 'visual-1': 1, 'visual-removed': 0 },
    });
  });
});
