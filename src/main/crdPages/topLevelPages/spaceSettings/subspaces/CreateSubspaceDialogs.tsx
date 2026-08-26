import { useTranslation } from 'react-i18next';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { CreateSubspaceDialog } from '@/crd/components/space/settings/CreateSubspaceDialog';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import type { UseCreateSubspaceResult } from './useCreateSubspace';

export type CreateSubspaceDialogsProps = {
  createSubspace: UseCreateSubspaceResult;
} & MarkdownUploadProps;

/**
 * Mounts the complete dialog set the create-subspace flow needs: the form, the
 * template picker, the template-overwrite confirmation, and the image crop
 * dialog.
 *
 * The flow is a chain of dialogs rather than a single one. Picking an avatar or
 * card banner does not put the file straight into form state — it is handed to
 * the crop dialog first, and only the cropped result becomes a form value. A
 * caller that mounts the form without the crop dialog therefore swallows every
 * image pick with no upload, no error and no feedback. Keeping the set in one
 * component means each entry point renders this instead of re-assembling its own
 * copy, so no entry point can drift and lose a member of the chain again.
 */
export function CreateSubspaceDialogs({
  createSubspace,
  onImageUpload,
  iframeAllowedUrls,
  onError,
}: CreateSubspaceDialogsProps) {
  const { t } = useTranslation('crd-spaceSettings');

  return (
    <>
      <CreateSubspaceDialog
        open={createSubspace.open}
        onOpenChange={open => {
          if (!open) createSubspace.closeDialog();
        }}
        values={createSubspace.values}
        errors={createSubspace.errors}
        selectedTemplateName={createSubspace.selectedTemplateName}
        selectedTemplateContent={createSubspace.selectedTemplateContent}
        selectedTemplateLoading={createSubspace.selectedTemplateLoading}
        onOpenTemplatePicker={createSubspace.onOpenTemplatePicker}
        onClearTemplate={createSubspace.onClearTemplate}
        submitting={createSubspace.submitting}
        canSubmit={createSubspace.canSubmit}
        avatarConstraints={createSubspace.avatarConstraints}
        cardBannerConstraints={createSubspace.cardBannerConstraints}
        onChange={createSubspace.onChange}
        onSubmit={() => void createSubspace.onSubmit()}
        onImageUpload={onImageUpload}
        iframeAllowedUrls={iframeAllowedUrls}
        onError={onError}
      />
      <TemplatePicker {...createSubspace.picker} />
      <ConfirmationDialog
        open={createSubspace.overwriteConfirmOpen}
        onOpenChange={open => {
          if (!open) createSubspace.onCancelOverwriteTemplate();
        }}
        title={t('subspaces.createDialog.template.overwriteConfirm.title')}
        description={t('subspaces.createDialog.template.overwriteConfirm.description')}
        confirmLabel={t('subspaces.createDialog.template.overwriteConfirm.confirm')}
        cancelLabel={t('subspaces.createDialog.template.overwriteConfirm.cancel')}
        onConfirm={createSubspace.onConfirmOverwriteTemplate}
        onCancel={createSubspace.onCancelOverwriteTemplate}
      />
      <ImageCropDialog
        open={Boolean(createSubspace.pendingCrop)}
        file={createSubspace.pendingCrop?.file}
        config={createSubspace.pendingCrop?.config ?? {}}
        onSave={({ file, altText }) => createSubspace.onCropComplete(file, altText)}
        onCancel={createSubspace.onCropCancel}
        title={t('subspaces.createDialog.crop.title')}
        description={t('subspaces.createDialog.crop.description')}
        saveLabel={t('subspaces.createDialog.crop.save')}
        savingLabel={t('subspaces.createDialog.crop.saving')}
        cancelLabel={t('subspaces.createDialog.crop.cancel')}
        altTextLabel={t('subspaces.createDialog.crop.altLabel')}
        altTextPlaceholder={t('subspaces.createDialog.crop.altPlaceholder')}
      />
    </>
  );
}
