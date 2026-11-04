import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommunityGuidelinesSection } from './CommunityGuidelinesSection';
import type { UseCommunityGuidelinesDataResult } from './useCommunityGuidelinesData';

vi.mock('react-i18next', () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }) };
});

const editorProps = vi.hoisted(() => ({
  referencesKey: undefined as unknown,
  referenceUploading: undefined as unknown,
}));
vi.mock('@/crd/components/space/settings/CommunityGuidelinesEditor', () => ({
  CommunityGuidelinesEditor: ({
    referencesKey,
    referenceUploading,
  }: {
    referencesKey?: unknown;
    referenceUploading?: boolean;
  }) => {
    editorProps.referencesKey = referencesKey;
    editorProps.referenceUploading = referenceUploading;
    return null;
  },
}));
vi.mock('@/crd/components/space/settings/CommunityGuidelinesPreview', () => ({
  CommunityGuidelinesPreview: ({ onEdit }: { onEdit: () => void }) => (
    <button type="button" onClick={onEdit}>
      edit guidelines
    </button>
  ),
}));

const guidelines = (referenceUploading: boolean): UseCommunityGuidelinesDataResult => ({
  value: { title: 'Guidelines', body: '', references: [] },
  loading: false,
  submitting: false,
  isDirty: true,
  canSave: !referenceUploading,
  onChange: vi.fn(),
  onSave: vi.fn(),
  onReset: vi.fn(),
  resetGeneration: 7,
  onApplyTemplate: vi.fn(),
  hasContent: true,
  onReferenceFileUpload: vi.fn(),
  referenceUploadAccept: undefined,
  referenceUploading,
});

const renderSection = (referenceUploading: boolean) => {
  const onApplyTemplate = vi.fn();
  const onSaveAsTemplate = vi.fn();
  render(
    <CommunityGuidelinesSection
      guidelines={guidelines(referenceUploading)}
      onApplyTemplate={onApplyTemplate}
      onSaveAsTemplate={onSaveAsTemplate}
      markdown={{}}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'edit guidelines' }));
  return {
    onApplyTemplate,
    onSaveAsTemplate,
    applyTemplate: screen.getByRole('button', { name: 'community.guidelines.applyTemplate' }),
    saveAsTemplate: screen.getByRole('button', { name: 'community.guidelines.saveAsTemplate' }),
  };
};

describe('CommunityGuidelinesSection — template actions while reference files upload', () => {
  it('disables Apply template and Save as template while an upload runs', () => {
    const { applyTemplate, saveAsTemplate, onApplyTemplate, onSaveAsTemplate } = renderSection(true);

    expect(applyTemplate).toBeDisabled();
    expect(saveAsTemplate).toBeDisabled();
    fireEvent.click(applyTemplate);
    fireEvent.click(saveAsTemplate);
    expect(onApplyTemplate).not.toHaveBeenCalled();
    expect(onSaveAsTemplate).not.toHaveBeenCalled();
  });

  it('enables both when no upload runs, and each click calls its callback', () => {
    const { applyTemplate, saveAsTemplate, onApplyTemplate, onSaveAsTemplate } = renderSection(false);

    expect(applyTemplate).toBeEnabled();
    expect(saveAsTemplate).toBeEnabled();
    fireEvent.click(applyTemplate);
    fireEvent.click(saveAsTemplate);
    expect(onApplyTemplate).toHaveBeenCalledOnce();
    expect(onSaveAsTemplate).toHaveBeenCalledOnce();
  });
});

describe('CommunityGuidelinesSection — Discard', () => {
  it("keys the references editor on the data hook's resetGeneration", () => {
    renderSection(false);

    expect(editorProps.referencesKey).toBe(7);
  });

  it("hands the upload owner's unsettled state to the references pickers", () => {
    renderSection(true);

    expect(editorProps.referenceUploading).toBe(true);
  });
});
