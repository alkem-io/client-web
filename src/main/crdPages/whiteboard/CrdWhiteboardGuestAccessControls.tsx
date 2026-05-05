import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { WhiteboardGuestAccessSection } from '@/crd/components/whiteboard/WhiteboardGuestAccessSection';
import { Separator } from '@/crd/primitives/separator';
import type { UseWhiteboardGuestAccessResult } from '@/domain/collaboration/whiteboard/hooks/useWhiteboardGuestAccess';

type CrdWhiteboardGuestAccessControlsProps = {
  whiteboard?: {
    authorization?: {
      myPrivileges?: AuthorizationPrivilege[];
    };
  };
  guestAccess: UseWhiteboardGuestAccessResult;
};

/**
 * CRD replacement for the MUI `WhiteboardGuestAccessControls` + `WhiteboardGuestAccessSection`
 * pair. Wires `useWhiteboardGuestAccess` results to a presentational CRD section, gates the
 * whole block on the `PUBLIC_SHARE` privilege, and owns the clipboard side effect (with
 * notify-based feedback).
 *
 * Strings come from the existing `share-dialog.guest-access.*` translation keys to avoid
 * duplicating them in a CRD namespace; the section itself stays free of the default i18n
 * namespace via prop-passed labels.
 */
export function CrdWhiteboardGuestAccessControls({ whiteboard, guestAccess }: CrdWhiteboardGuestAccessControlsProps) {
  const { t } = useTranslation();
  const notify = useNotification();

  const hasPublicSharePrivilege =
    whiteboard?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.PublicShare) ?? false;

  if (!hasPublicSharePrivilege) return null;

  const handleCopy = async () => {
    if (!guestAccess.guestLink) return;
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(guestAccess.guestLink);
      notify(t('share-dialog.platforms.clipboard.copied'), 'success');
    } catch {
      notify(t('share-dialog.guest-access.errors.UNKNOWN'), 'error');
    }
  };

  const handleToggle = (next: boolean) => {
    if (!guestAccess.canToggle || guestAccess.isUpdating) return;
    void Promise.resolve(guestAccess.onToggle(next)).catch(() => undefined);
  };

  return (
    <>
      <Separator />
      <WhiteboardGuestAccessSection
        canToggle={guestAccess.canToggle}
        enabled={guestAccess.enabled}
        guestLink={guestAccess.guestLink}
        isUpdating={guestAccess.isUpdating}
        hasError={guestAccess.hasError}
        label={t('share-dialog.guest-access.label')}
        toggleDescription={t('share-dialog.guest-access.toggle-description')}
        toggleAriaLabel={t('share-dialog.guest-access.toggle-label')}
        urlLabel={t('share-dialog.guest-access.url-label')}
        copyAriaLabel={t('share-dialog.guest-access.copy-url')}
        errorMessage={t('share-dialog.guest-access.errors.UNKNOWN')}
        errorDismissAriaLabel={t('buttons.close')}
        onToggle={handleToggle}
        onResetError={guestAccess.resetError}
        onCopy={handleCopy}
      />
    </>
  );
}
