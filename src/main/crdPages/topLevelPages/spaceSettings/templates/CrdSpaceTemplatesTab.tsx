import { useTranslation } from 'react-i18next';
import { useSpaceTemplatesManagerQuery } from '@/core/apollo/generated/apollo-hooks';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { TemplateFormDialog } from '@/crd/components/templates/TemplateFormDialog';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import { TemplatePreviewDialog } from '@/crd/components/templates/TemplatePreviewDialog';
import { TemplatesManagerView } from '@/crd/components/templates/TemplatesManagerView';
import type { TemplateType } from '@/crd/components/templates/types';
import { useStorageConfigContext } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useMarkdownEditorIntegration } from '@/main/crdPages/markdown/useMarkdownEditorIntegration';
import { useTemplatesManager } from '@/main/crdPages/templates/useTemplatesManager';
import { useReferenceFileUpload } from '@/main/crdPages/utils/useReferenceFileUpload';

const allTypes = (_type: TemplateType) => true;

/**
 * Space Settings → Templates, CRD-native: the holder-agnostic `TemplatesManagerView` driven by
 * `useTemplatesManager` + the shared preview / create-edit / delete dialogs.
 *
 * Preview / create / duplicate / edit / delete / import-from-library are wired for all five template
 * types (incl. Callout, via `CalloutTemplateForm` — T025). Page access is the gate — no per-type authz.
 */
export function CrdSpaceTemplatesTab({ spaceId, accountId }: { spaceId: string; accountId?: string }) {
  const { t } = useTranslation('crd-templates');
  const { data } = useSpaceTemplatesManagerQuery({ variables: { spaceId }, skip: !spaceId });
  const templatesSetId = data?.lookup.space?.templatesManager?.templatesSet?.id;
  // Ambient space `StorageConfigContextProvider` (CrdSpacePageLayout). Editing
  // a template uploads to the space bucket (temporaryLocation: false); creating
  // one has no bucket yet → temporary (server GCs if abandoned) — mirrors MUI.
  const mdEdit = useMarkdownEditorIntegration();
  const mdCreate = useMarkdownEditorIntegration({ temporaryLocation: true });
  // References paperclip — uploads land in the space bucket (`temporaryLocation: true`), so a file
  // attached before a new template exists is GC'd if the create is abandoned, and claimed on save.
  const { onFileUpload: onReferenceFileUpload, accept: referenceUploadAccept } = useReferenceFileUpload(
    useStorageConfigContext()
  );
  const tm = useTemplatesManager({
    holderKind: 'space',
    templatesSetId,
    accountId,
    spaceId,
    markdownUpload: { create: mdCreate, edit: mdEdit },
    referenceUpload: { onFileUpload: onReferenceFileUpload, accept: referenceUploadAccept },
  });

  return (
    <>
      <TemplatesManagerView
        holderKind="space"
        categories={tm.categories}
        loading={tm.loading}
        duplicatingId={tm.duplicatingId}
        deletingId={tm.deletingId}
        canCreate={allTypes}
        canEdit={allTypes}
        canDelete={() => true}
        canImport={allTypes}
        onCreate={tm.onCreate}
        onImport={tm.onImport}
        onTemplateAction={tm.onTemplateAction}
      />

      <TemplatePicker {...tm.importPicker} />

      {tm.preview.header && (
        <TemplatePreviewDialog
          open={tm.preview.open}
          onClose={tm.preview.onClose}
          header={tm.preview.header}
          content={tm.preview.content}
          contentLoading={tm.preview.contentLoading}
          onEdit={tm.preview.canEdit ? tm.preview.onEdit : undefined}
        />
      )}

      <TemplateFormDialog
        open={tm.form.open}
        intent={tm.form.intent}
        type={tm.form.type}
        commonValue={tm.form.commonValue}
        commonErrors={tm.form.commonErrors}
        onCommonChange={tm.form.onCommonChange}
        perTypeFormSlot={tm.form.perTypeFormSlot}
        submitting={tm.form.submitting}
        onSubmit={tm.form.onSubmit}
        onCancel={tm.form.onCancel}
        isDirty={tm.form.isDirty}
      />

      <ConfirmationDialog
        open={tm.pendingDelete !== null}
        onOpenChange={o => {
          if (!o) tm.cancelDelete();
        }}
        variant="destructive"
        title={t('delete.title')}
        description={t('delete.body', { name: tm.pendingDelete?.name ?? '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
        onConfirm={() => void tm.confirmDelete()}
        onCancel={tm.cancelDelete}
        loading={tm.deletingId !== null}
      />
    </>
  );
}
