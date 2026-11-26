import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateSpaceAccountFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { CreateSpaceDialog } from '@/crd/components/space/CreateSpaceDialog';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import { useConfig } from '@/domain/platform/config/useConfig';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { useCreateSpaceAccount } from '@/domain/space/components/CreateSpace/hooks/spacePlans/useCreateSpaceAccount';
import { useCreateDialogMarkdown } from '@/domain/space/components/CreateSpace/hooks/useCreateDialogMarkdown';
import { type CreatedSpaceResult, useCreateSpace } from './useCreateSpace';

export type CrdCreateSpaceDialogProps = {
  open: boolean;
  onClose: () => void;
  /** The organisation whose account hosts the Space; the viewer's own account when omitted. */
  organizationId?: string;
  /** Organization account display name — passed from the org tab; omitted on the user's own account. */
  accountName?: string;
  onSpaceCreated?: (space: CreatedSpaceResult) => void;
};

/**
 * Integration connector for the CRD Create Space dialog. Replaces the MUI
 * `<CreateSpace />` at the entry points. Reads the hosting account natively, wires the
 * terms URL from platform config, and mounts the dialog + template picker +
 * overwrite-confirm. Inline description images have no designed pre-creation path
 * (useCreateDialogMarkdown).
 */
export function CrdCreateSpaceDialog({
  open,
  onClose,
  organizationId,
  accountName,
  onSpaceCreated,
}: CrdCreateSpaceDialogProps) {
  const { account } = useCreateSpaceAccount({ organizationId, skip: !open });
  return (
    <Suspense fallback={null}>
      {/*
       * Local Suspense boundary. The connector calls useTranslation('crd-createSpace')
       * — a lazily-loaded i18n namespace — and hosts the lazy markdown editor. Without
       * this boundary their first-load suspension bubbles up to the page-level Suspense
       * and remounts the entire host page (a full flash the first time the dialog is
       * used). `null` fallback: the dialog is a modal, so nothing should show until it
       * is ready. Mirrors the self-contained pattern in MarkdownEditor.
       */}
      <CreateSpaceDialogConnector
        open={open}
        onClose={onClose}
        account={account}
        accountName={accountName}
        onSpaceCreated={onSpaceCreated}
      />
    </Suspense>
  );
}

type CreateSpaceDialogConnectorProps = Omit<CrdCreateSpaceDialogProps, 'organizationId'> & {
  account: CreateSpaceAccountFragment | undefined;
};

function CreateSpaceDialogConnector({
  open,
  onClose,
  account,
  accountName,
  onSpaceCreated,
}: CreateSpaceDialogConnectorProps) {
  const { t } = useTranslation('crd-createSpace');
  const config = useConfig();
  const origin = usePlatformOrigin();
  const urlPrefix = origin ? `${origin.toLowerCase()}/` : undefined;
  const create = useCreateSpace({ open, account, onClose, onSpaceCreated });
  const md = useCreateDialogMarkdown();

  return (
    <>
      <CreateSpaceDialog
        open={open}
        onOpenChange={next => {
          if (!next) onClose();
        }}
        values={create.values}
        errors={create.errors}
        selectedTemplateName={create.selectedTemplateName}
        selectedTemplateContent={create.selectedTemplateContent}
        selectedTemplateLoading={create.selectedTemplateLoading}
        onOpenTemplatePicker={create.onOpenTemplatePicker}
        onClearTemplate={create.onClearTemplate}
        bannerConstraints={create.bannerConstraints}
        cardBannerConstraints={create.cardBannerConstraints}
        termsUrl={config.locations?.terms}
        urlPrefix={urlPrefix}
        accountName={accountName}
        submitting={create.submitting}
        canSubmit={create.canSubmit}
        noPlanAvailable={create.noPlanAvailable}
        onChange={create.onChange}
        onSubmit={() => void create.onSubmit()}
        onImageUpload={md.onImageUpload}
        iframeAllowedUrls={md.iframeAllowedUrls}
        onError={md.onError}
      />
      <TemplatePicker {...create.picker} />
      <ConfirmationDialog
        open={create.overwriteConfirmOpen}
        onOpenChange={next => {
          if (!next) create.onCancelOverwriteTemplate();
        }}
        title={t('template.overwriteConfirm.title')}
        description={t('template.overwriteConfirm.description')}
        confirmLabel={t('template.overwriteConfirm.confirm')}
        cancelLabel={t('template.overwriteConfirm.cancel')}
        onConfirm={create.onConfirmOverwriteTemplate}
        onCancel={create.onCancelOverwriteTemplate}
      />
      <ImageCropDialog
        open={Boolean(create.pendingCrop)}
        file={create.pendingCrop?.file}
        config={create.pendingCrop?.config ?? {}}
        onSave={({ file, altText }) => create.onCropComplete(file, altText)}
        onCancel={create.onCropCancel}
        title={t('crop.title')}
        description={t('crop.description')}
        saveLabel={t('crop.save')}
        savingLabel={t('crop.saving')}
        cancelLabel={t('crop.cancel')}
        altTextLabel={t('crop.altLabel')}
        altTextPlaceholder={t('crop.altPlaceholder')}
      />
    </>
  );
}
