import { useRef, useState } from 'react';
import { InnovationPackAdminView } from '@/crd/components/innovationPack/InnovationPackAdminView';
import type {
  InnovationPackFormErrors,
  InnovationPackFormValues,
} from '@/crd/components/innovationPack/types';
import { TemplatePreviewDialog } from '@/crd/components/templates/TemplatePreviewDialog';
import type { TemplateAction, TemplateContent, TemplateType } from '@/crd/components/templates/types';
import {
  MOCK_ALL_TEMPLATES,
  MOCK_PACK_PROFILE,
  MOCK_TEMPLATE_CATEGORIES,
  MOCK_TEMPLATE_CONTENT_BY_ID,
} from '../data/templates';

/**
 * Standalone preview for `InnovationPackAdminView` (T088) — the pack admin screen.
 * Hosts the pack-details edit form above the holder-agnostic templates manager.
 * No "Delete pack" action here (that lives in the Account-tab pack-card menu).
 */
export function InnovationPackAdminPage() {
  const [values, setValues] = useState<InnovationPackFormValues>({
    name: MOCK_PACK_PROFILE.name,
    description: MOCK_PACK_PROFILE.description,
    tags: MOCK_PACK_PROFILE.tags,
    references: MOCK_PACK_PROFILE.references.map(r => ({
      id: r.id,
      name: r.name,
      uri: r.uri,
      description: r.description ?? '',
    })),
    listedInStore: true,
    searchVisibility: 'public',
  });
  const [submitting, setSubmitting] = useState(false);
  const initialSnapshot = useRef(JSON.stringify(values));

  const errors: InnovationPackFormErrors = !values.name.trim() ? { name: 'A pack name is required.' } : {};

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<TemplateContent | undefined>(undefined);

  const previewHeader = previewId ? MOCK_ALL_TEMPLATES.find(t => t.id === previewId) : undefined;

  const openPreview = (id: string) => {
    setPreviewId(id);
    setPreviewLoading(true);
    setPreviewContent(undefined);
    window.setTimeout(() => {
      setPreviewContent(MOCK_TEMPLATE_CONTENT_BY_ID[id]);
      setPreviewLoading(false);
    }, 350);
  };

  const allTypes = (_t: TemplateType) => true;
  const noImport = () => false;

  return (
    <div className="crd-root mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-page-title">{MOCK_PACK_PROFILE.name}</h1>
        <p className="text-body text-muted-foreground">
          Mock preview of <code className="text-caption">InnovationPackAdminView</code>: pack-details form (provider
          read-only) + the holder-agnostic templates manager.
        </p>
      </header>

      <InnovationPackAdminView
        form={{
          value: values,
          errors,
          onChange: setValues,
          onSubmit: () => {
            setSubmitting(true);
            window.setTimeout(() => setSubmitting(false), 1000);
          },
          submitting,
          isDirty: JSON.stringify(values) !== initialSnapshot.current,
          providerName: 'Google Ventures',
          avatarUrl: undefined,
          // Preview only — stage the raw file directly (the real flow opens the CRD ImageCropDialog).
          onAvatarFileSelected: file => setValues(prev => ({ ...prev, avatarFile: file })),
        }}
        templatesManager={{
          holderKind: 'innovationPack',
          categories: MOCK_TEMPLATE_CATEGORIES,
          canCreate: allTypes,
          canEdit: allTypes,
          canDelete: allTypes,
          canImport: noImport,
          onCreate: () => undefined,
          onImport: () => undefined,
          onTemplateAction: (id: string, action: TemplateAction) => {
            if (action === 'preview') openPreview(id);
          },
        }}
      />

      {previewHeader && (
        <TemplatePreviewDialog
          open={previewId !== null}
          onClose={() => setPreviewId(null)}
          header={previewHeader}
          content={previewContent}
          contentLoading={previewLoading}
        />
      )}
    </div>
  );
}
