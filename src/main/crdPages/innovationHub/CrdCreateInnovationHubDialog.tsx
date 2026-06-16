import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { CreateInnovationHubDialog } from '@/crd/components/innovationHub/CreateInnovationHubDialog';
import type {
  CreateInnovationHubErrors,
  CreateInnovationHubValues,
} from '@/crd/components/innovationHub/createInnovationHub.types';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useMarkdownEditorIntegration } from '@/main/crdPages/markdown/useMarkdownEditorIntegration';
import { type CreateInnovationHubErrorCode, validateCreateInnovationHub } from './createInnovationHubSchema';
import { useCreateInnovationHub } from './useCreateInnovationHub';

export type CrdCreateInnovationHubDialogProps = {
  accountId: string;
  /** Account display name for the dialog subtitle. Omitted ⇒ the user's own account. */
  accountName?: string;
  open: boolean;
  onClose: () => void;
};

const EMPTY: CreateInnovationHubValues = { subdomain: '', name: '', tagline: '', description: '' };

/**
 * Integration connector for the CRD Create Innovation Hub dialog. Replaces the MUI
 * `CreateInnovationHubDialog` at the account-tab entry points. Mirrors
 * `CrdCreateInnovationPackDialog`: account-scoped storage context (markdown image
 * uploads) behind a local Suspense boundary, form state + validation, and the
 * `useCreateInnovationHub` hook (List-type hub, empty filter, no navigation).
 */
export function CrdCreateInnovationHubDialog({
  accountId,
  accountName,
  open,
  onClose,
}: CrdCreateInnovationHubDialogProps) {
  return (
    <StorageConfigContextProvider locationType="account" accountId={accountId} skip={!open}>
      <Suspense fallback={null}>
        <Connector accountId={accountId} accountName={accountName} open={open} onClose={onClose} />
      </Suspense>
    </StorageConfigContextProvider>
  );
}

function Connector({ accountId, accountName, open, onClose }: CrdCreateInnovationHubDialogProps) {
  const { t } = useTranslation('crd-innovationHub');
  const notify = useNotification();
  const md = useMarkdownEditorIntegration({ temporaryLocation: true });

  const [value, setValue] = useState<CreateInnovationHubValues>(EMPTY);
  // Surface a field's error only once it's been touched — so the dialog opens clean.
  const [touched, setTouched] = useState<Partial<Record<keyof CreateInnovationHubValues, boolean>>>({});

  const codes = validateCreateInnovationHub(value);
  const message = (code: CreateInnovationHubErrorCode): string => {
    switch (code) {
      case 'required':
        return t('createHub.validation.required');
      case 'min3':
        return t('createHub.validation.min3');
      case 'maxSmall':
        return t('createHub.validation.maxSmall', { count: SMALL_TEXT_LENGTH });
      case 'maxMid':
        return t('createHub.validation.maxMid', { count: MID_TEXT_LENGTH });
      case 'maxMarkdown':
        return t('createHub.validation.maxMarkdown', { count: MARKDOWN_TEXT_LENGTH });
      case 'subdomainRequired':
        return t('createHub.validation.subdomainRequired');
      case 'subdomainFormat':
        return t('createHub.validation.subdomainFormat');
      case 'subdomainMin':
        return t('createHub.validation.subdomainMin');
      case 'subdomainMax':
        return t('createHub.validation.subdomainMax');
    }
  };
  // Touched-gated subset shown to the user; full `codes` still drives `canSubmit`.
  const displayErrors: CreateInnovationHubErrors = {};
  for (const key of Object.keys(codes) as (keyof CreateInnovationHubValues)[]) {
    const code = codes[key];
    if (code && touched[key]) displayErrors[key] = message(code);
  }

  const handleClose = () => {
    setValue(EMPTY);
    setTouched({});
    onClose();
  };

  const { create, creating } = useCreateInnovationHub({
    accountId,
    onCreated: () => {
      notify(t('createHub.createSuccess'), 'success');
      handleClose();
    },
  });

  const canSubmit = !creating && Object.keys(codes).length === 0;

  const onChange = (next: CreateInnovationHubValues) => {
    setTouched(prev => {
      const updated = { ...prev };
      for (const key of Object.keys(next) as (keyof CreateInnovationHubValues)[]) {
        if (next[key] !== value[key]) updated[key] = true;
      }
      return updated;
    });
    setValue(next);
  };

  const onCreate = async () => {
    if (!canSubmit) return;
    try {
      await create(value);
    } catch {
      notify(t('createHub.createError'), 'error');
    }
  };

  return (
    <CreateInnovationHubDialog
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
