import { useTranslation } from 'react-i18next';

import type { ActionPermission } from '@/domain/access/permissions/useActionPermission';

/**
 * Maps a permission decision to the copy shown on a gated control.
 *
 * Returns `undefined` when the action is allowed, which is exactly what `GatedAction`
 * treats as "not gated". One surface-agnostic string set serves every surface, so the
 * copy never names a privilege token or an escalation target (spec FR-003).
 */
const usePermissionReasonText = () => {
  const { t } = useTranslation('crd-common');

  return (permission: ActionPermission): string | undefined => {
    switch (permission.reason) {
      case 'allowed':
        return undefined;
      case 'checking':
        return t('permissions.checking');
      case 'unverifiable':
        return t('permissions.unverifiable');
      default:
        return t('permissions.denied');
    }
  };
};

export default usePermissionReasonText;
