/** @vitest-environment jsdom */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  updateCalloutTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  updateCalloutForm: vi.fn(),
  uploadFile: vi.fn(),
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
  useUploadFileMutation: () => [harness.uploadFile, { loading: false }],
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

vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: () => null,
}));

import type { CommunityGuidelinesTemplateValues } from '@/crd/components/templates/types';
import { createFormQuestion, DEFAULT_FORM_SETTINGS } from '@/crd/forms/callout/formValues';
import { EMPTY_CALLOUT_FORM_VALUES } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { useReferenceFileUpload } from '@/main/crdPages/utils/useReferenceFileUpload';
import { type TemplateReferenceUpload, type UseTemplateFormsResult, useTemplateForms } from '../useTemplateForms';

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

const guidelinesTemplate = (
  key: string,
  references: CommunityGuidelinesTemplateValues['references']
): CommunityGuidelinesTemplateValues => ({
  type: 'communityGuidelines',
  name: `Template ${key}`,
  description: `Description ${key}`,
  tags: [],
  title: `Guidelines ${key}`,
  guidelinesMarkdown: '',
  references,
});

let latest: UseTemplateFormsResult;

/** Renders the per-type form only while the dialog is open, as `TemplateFormDialog` does. */
function GuidelinesHarness({ referenceUpload }: { referenceUpload: TemplateReferenceUpload }) {
  const forms = useTemplateForms({ templatesSetId: 'templates-set-1', referenceUpload });
  useEffect(() => {
    latest = forms;
  });
  return <>{forms.open && forms.perTypeFormSlot}</>;
}

const openEditGuidelines = (key: string, references: CommunityGuidelinesTemplateValues['references']) =>
  act(() =>
    latest.openEdit(`template-${key}`, guidelinesTemplate(key, references), `cg-${key}`, undefined, {
      profileId: `profile-${key}`,
      originalReferenceIds: references.flatMap(r => (r.id ? [r.id] : [])),
    })
  );

describe('useTemplateForms — community guidelines references while files upload', () => {
  beforeEach(() => {
    harness.updateTemplate.mockReset();
  });

  it('reports the reference upload as form.uploading', () => {
    const { rerender } = render(<GuidelinesHarness referenceUpload={{ uploading: true }} />);
    expect(latest.uploading).toBe(true);

    rerender(<GuidelinesHarness referenceUpload={{ uploading: false }} />);
    expect(latest.uploading).toBe(false);
  });

  it('disables the references paperclips while the template saves', async () => {
    harness.updateTemplate.mockReturnValue(new Promise(() => {}));
    render(<GuidelinesHarness referenceUpload={{ onFileUpload: vi.fn() }} />);
    openEditGuidelines('a', [{ id: 'ref-a', name: 'Link', uri: 'https://a', description: '' }]);
    expect(screen.getByRole('button', { name: 'references.attachFile' })).toBeEnabled();

    act(() => latest.onSubmit());

    await waitFor(() => expect(latest.submitting).toBe(true));
    expect(screen.getByRole('button', { name: 'references.attachFile' })).toBeDisabled();
  });

  it("a cancelled template's late upload does not change the next template's form", async () => {
    const resolvers: Array<(url: string) => void> = [];
    const onFileUpload = vi.fn((_file: File) => new Promise<string | null>(resolve => resolvers.push(resolve)));
    render(<GuidelinesHarness referenceUpload={{ onFileUpload }} />);

    openEditGuidelines('a', [{ name: '', uri: '', description: '' }]);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'alpha.pdf')] } });
    expect(onFileUpload).toHaveBeenCalledOnce();

    act(() => latest.onCancel());
    await waitFor(() => expect(latest.open).toBe(false));
    const referencesB = [{ id: 'ref-b', name: 'B link', uri: 'https://b', description: 'kept' }];
    openEditGuidelines('b', referencesB);
    await act(async () => resolvers[0]('https://cdn/alpha'));

    expect(latest.commonValue).toEqual({ name: 'Template b', description: 'Description b', tags: [] });
    expect(screen.getByLabelText('form.communityGuidelines.title')).toHaveValue('Guidelines b');
    expect((screen.getAllByLabelText('references.uriLabel') as HTMLInputElement[]).map(input => input.value)).toEqual([
      'https://b',
    ]);
    expect(latest.isDirty).toBe(false);
  });
});

/** One upload owner for the dialog host's lifetime, as the templates page holds it. */
function GuidelinesWithUploadOwner() {
  const upload = useReferenceFileUpload({
    storageBucketId: 'bucket-1',
    allowedMimeTypes: [],
    maxFileSize: 1024,
    canUpload: true,
    temporaryLocation: true,
  });
  return <GuidelinesHarness referenceUpload={upload} />;
}

describe('useTemplateForms — reopening while a cancelled multi-file pick still uploads', () => {
  const requests: { name: string; resolve: (url: string) => void }[] = [];
  const pick = (names: string[]) =>
    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: names.map(name => new File(['x'], name)) },
    });
  const settle = async (names: string[]) => {
    for (const name of names) {
      await act(async () => requests.find(r => r.name === name)?.resolve(`https://cdn/${name}`));
    }
  };
  const uris = () => (screen.getAllByLabelText('references.uriLabel') as HTMLInputElement[]).map(input => input.value);

  beforeEach(() => {
    requests.length = 0;
    harness.uploadFile.mockReset();
    harness.uploadFile.mockImplementation(
      ({ variables }: { variables: { file: File } }) =>
        new Promise(resolve =>
          requests.push({
            name: variables.file.name,
            resolve: url => resolve({ data: { uploadFileOnStorageBucket: { url } } }),
          })
        )
    );
  });

  it("stops A's queue, keeps A's results out of B, and withholds Save through both picks", async () => {
    render(<GuidelinesWithUploadOwner />);

    openEditGuidelines('a', [{ name: '', uri: '', description: '' }]);
    pick(['a1.pdf', 'a2.pdf', 'a3.pdf', 'a4.pdf']);
    expect(requests.map(r => r.name)).toEqual(['a1.pdf', 'a2.pdf', 'a3.pdf']);
    expect(latest.uploading).toBe(true);

    act(() => latest.onCancel());
    await waitFor(() => expect(latest.open).toBe(false));
    openEditGuidelines('b', [{ id: 'ref-b', name: 'B link', uri: 'https://b', description: '' }]);
    expect(screen.getByRole('button', { name: 'references.attachFile' })).toBeEnabled();

    pick(['b1.pdf', 'b2.pdf']);
    expect(requests.map(r => r.name)).toEqual(['a1.pdf', 'a2.pdf', 'a3.pdf', 'b1.pdf', 'b2.pdf']);

    await settle(['a1.pdf', 'a2.pdf', 'a3.pdf']);
    expect(harness.uploadFile).toHaveBeenCalledTimes(5);
    expect(uris()).toEqual(['https://b']);
    expect(latest.uploading).toBe(true);

    await settle(['b1.pdf', 'b2.pdf']);
    expect(uris()).toEqual(['https://b', 'https://cdn/b1.pdf', 'https://cdn/b2.pdf']);
    expect(latest.uploading).toBe(false);
  });
});
