import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { CreateInnovationPackDialog } from '@/crd/components/innovationPack/CreateInnovationPackDialog';
import type { CreateInnovationPackErrors, CreateInnovationPackValues } from '@/crd/components/innovationPack/types';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useMarkdownEditorIntegration } from '@/main/crdPages/markdown/useMarkdownEditorIntegration';
import { useCreateInnovationPack } from './useCreateInnovationPack';

export type CrdCreateInnovationPackDialogProps = {
  accountId: string;
  /** Account display name for the dialog subtitle. Omitted ⇒ the user's own account. */
  accountName?: string;
  open: boolean;
  onClose: () => void;
};

const EMPTY: CreateInnovationPackValues = { name: '', description: '' };

/**
 * Integration connector for the CRD Create Innovation Pack dialog. Replaces the
 * MUI `CreateInnovationPackDialog` at the account-tab entry points. Provides the
 * account-scoped storage context the markdown editor needs (temporary-location
 * uploads before the pack exists) behind a local Suspense boundary, owns form
 * state + validation, and wires `useCreateInnovationPack`.
 *
 * Strict parity: required markdown description, name 3–128, and **no navigation**
 * on success (the shared hook still returns `{ id, url }` for the legacy MUI
 * `ContributorAccountView`; here we ignore `url`).
 */
export function CrdCreateInnovationPackDialog({
  accountId,
  accountName,
  open,
  onClose,
}: CrdCreateInnovationPackDialogProps) {
  return (
    <StorageConfigContextProvider locationType="account" accountId={accountId} skip={!open}>
      {/* Local boundary: the markdown editor + crd-markdown namespace lazy-load; without this
          their first-load suspension would remount the host account tab. Mirrors CrdCreateSpaceDialog. */}
      <Suspense fallback={null}>
        <Connector accountId={accountId} accountName={accountName} open={open} onClose={onClose} />
      </Suspense>
    </StorageConfigContextProvider>
  );
}

function Connector({ accountId, accountName, open, onClose }: CrdCreateInnovationPackDialogProps) {
  const { t } = useTranslation('crd-templates');
  // Notifications reuse the existing (non-frozen) core keys the MUI dialog uses.
  const { t: tCore } = useTranslation();
  const notify = useNotification();
  const md = useMarkdownEditorIntegration({ temporaryLocation: true });

  const [value, setValue] = useState<CreateInnovationPackValues>(EMPTY);
  // Surface a field's error only once it's been touched — so the dialog opens clean.
  const [touched, setTouched] = useState<Partial<Record<keyof CreateInnovationPackValues, boolean>>>({});

  // Full validation drives `canSubmit` (button enable/disable); `displayErrors` is the
  // touched-gated subset actually shown to the user.
  const validationErrors: CreateInnovationPackErrors = {};
  const name = value.name.trim();
  if (!name) {
    validationErrors.name = t('createPack.validation.required');
  } else if (name.length < 3) {
    validationErrors.name = t('createPack.validation.min3');
  } else if (name.length > SMALL_TEXT_LENGTH) {
    validationErrors.name = t('createPack.validation.maxSmall', { count: SMALL_TEXT_LENGTH });
  }
  if (!value.description.trim()) {
    validationErrors.description = t('createPack.validation.required');
  } else if (value.description.length > MARKDOWN_TEXT_LENGTH) {
    validationErrors.description = t('createPack.validation.maxMarkdown', { count: MARKDOWN_TEXT_LENGTH });
  }

  const displayErrors: CreateInnovationPackErrors = {};
  if (touched.name) displayErrors.name = validationErrors.name;
  if (touched.description) displayErrors.description = validationErrors.description;

  const handleClose = () => {
    setValue(EMPTY);
    setTouched({});
    onClose();
  };

  const { create, creating } = useCreateInnovationPack({
    accountId,
    // Ignore `url` — strict parity = no navigation; just refresh + toast + close.
    onCreated: () => {
      notify(tCore('pages.admin.innovation-packs.notifications.pack-created'), 'success');
      handleClose();
    },
  });

  const canSubmit = !creating && Object.keys(validationErrors).length === 0;

  const onChange = (next: CreateInnovationPackValues) => {
    setTouched(prev => ({
      ...prev,
      name: prev.name || next.name !== value.name,
      description: prev.description || next.description !== value.description,
    }));
    setValue(next);
  };

  const onCreate = async () => {
    if (!canSubmit) return;
    try {
      await create(value);
    } catch {
      notify(tCore('pages.admin.innovation-packs.notifications.pack-error'), 'error');
    }
  };

  return (
    <CreateInnovationPackDialog
      open={open}
      onClose={handleClose}
      value={value}
      errors={displayErrors}
      onChange={onChange}
      onCreate={onCreate}
      creating={creating}
      canSubmit={canSubmit}
      accountName={accountName}
      onImageUpload={md.onImageUpload}
      iframeAllowedUrls={md.iframeAllowedUrls}
      onError={md.onError}
    />
  );
}
