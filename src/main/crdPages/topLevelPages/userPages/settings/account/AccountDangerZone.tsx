import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { SettingsSection } from '@/crd/components/common/SettingsSection';
import { DeleteAccountCard } from '@/crd/components/user/settings/DeleteAccountCard';
import { buildSettingsTabUrl, buildUserAccountUrl } from '@/main/routing/urlBuilders';
import useDeleteAccount from './useDeleteAccount';

/**
 * Danger Zone at the end of the User Account tab (spec 054 FR-001, amended
 * 2026-10-23): the self-service Delete Account flow. Mounted only for the
 * profile owner, so the delete hook — and its `?resume=delete-account`
 * re-authentication resume — never runs for an admin viewing someone else.
 */
const AccountDangerZone = ({
  userId,
  displayName,
  profileUrl,
}: {
  userId: string;
  displayName: string;
  profileUrl: string;
}) => {
  const { t } = useTranslation('crd-contributorSettings');
  const [searchParams] = useSearchParams();
  // Open the section when returning from re-authentication, so the inline
  // pre-flight / re-auth errors are visible; the hook clears the flag after mount.
  const [resuming] = useState(() => searchParams.get('resume') === 'delete-account');
  const deleteAccount = useDeleteAccount(userId, buildSettingsTabUrl(profileUrl, 'account'));

  return (
    <SettingsSection
      title={t('user.account.dangerZone.title')}
      icon={<AlertTriangle className="size-4" />}
      iconColor="rose"
      defaultOpen={resuming}
    >
      <DeleteAccountCard
        displayName={displayName}
        dialog={deleteAccount.dialog}
        onOpen={deleteAccount.onOpen}
        onTypedNameChange={deleteAccount.onTypedNameChange}
        onConfirm={deleteAccount.onConfirm}
        onCancel={deleteAccount.onCancel}
        onDialogOpenChange={deleteAccount.onDialogOpenChange}
        accountResourcesUrl={buildUserAccountUrl(profileUrl)}
      />
    </SettingsSection>
  );
};

export default AccountDangerZone;
