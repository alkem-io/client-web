import { useTranslation } from 'react-i18next';
import { Error404 } from '@/core/pages/Errors/Error404';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { InnovationPackAdminView } from '@/crd/components/innovationPack/InnovationPackAdminView';
import { TemplateFormDialog } from '@/crd/components/templates/TemplateFormDialog';
import { TemplatePreviewDialog } from '@/crd/components/templates/TemplatePreviewDialog';
import type { TemplatesManagerViewProps, TemplateType } from '@/crd/components/templates/types';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useInnovationPackAdmin } from './useInnovationPackAdmin';

const allTypes = (_type: TemplateType) => true;

/**
 * Innovation Pack admin (templates + details), CRD-native — `<pack.profile.url>/settings`.
 *
 * Composes the holder-agnostic `TemplatesManagerView` (`holderKind: 'innovationPack'`)
 * with the US7 pack-details edit form, both driven by `useInnovationPackAdmin`.
 *
 * Import-from-library is Space-only, so `canImport` is `false` here. Page access is the
 * gate — no per-type authz. No "delete pack" action on this page; pack deletion lives
 * in the Account-tab pack-card three-dot menu (FR-042).
 */
export const CrdInnovationPackAdminPage = () => {
  const { t } = useTranslation('crd-templates');
  const { loading, notFound, innovationPackId, pack, tm, form } = useInnovationPackAdmin();
  usePageTitle(pack?.displayName);

  if (notFound) {
    return <Error404 />;
  }

  const templatesManager: TemplatesManagerViewProps = {
    holderKind: 'innovationPack',
    categories: tm.categories,
    loading: loading || tm.loading,
    duplicatingId: tm.duplicatingId,
    deletingId: tm.deletingId,
    canCreate: allTypes,
    canEdit: allTypes,
    canDelete: () => true,
    canImport: () => false,
    onCreate: tm.onCreate,
    onImport: tm.onImport,
    onTemplateAction: tm.onTemplateAction,
  };

  return (
    <StorageConfigContextProvider locationType="innovationPack" innovationPackId={innovationPackId}>
      <div className="crd-root mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
        <header className="space-y-1">
          <h1 className="text-page-title">{pack?.displayName ?? ''}</h1>
          <p className="text-body text-muted-foreground">{t('packAdmin.subtitle')}</p>
        </header>

        <InnovationPackAdminView form={form} templatesManager={templatesManager} />

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
          description={t(tm.pendingDelete?.isUsedAsDefault ? 'delete.bodyUsedAsDefault' : 'delete.body', {
            name: tm.pendingDelete?.name ?? '',
          })}
          confirmLabel={t('delete.confirm')}
          cancelLabel={t('delete.cancel')}
          onConfirm={() => void tm.confirmDelete()}
          onCancel={tm.cancelDelete}
          loading={tm.deletingId !== null}
        />
      </div>
    </StorageConfigContextProvider>
  );
};

export default CrdInnovationPackAdminPage;
