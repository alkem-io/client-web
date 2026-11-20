import { type MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeleteSpaceMutation, useSpaceAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type {
  AccountHost,
  AccountPlan,
  AccountVisibility,
} from '@/crd/components/space/settings/SpaceSettingsAccountView';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { mapAccountHost, mapAccountPlan, mapAccountVisibility } from './accountMapper';

export type UseAccountTabDataResult = {
  url: string;
  plan: AccountPlan | null;
  visibility: AccountVisibility | null;
  host: AccountHost | null;
  contactSupportHref: string;
  changeLicenseHref: string | null;
  canDeleteSpace: boolean;
  loading: boolean;
  onDeleteSpace: () => void;
  onCopyUrl: () => Promise<boolean>;
  pendingDeleteSpace: boolean;
  deletingSpace: boolean;
  confirmDeleteSpace: (event: MouseEvent<HTMLButtonElement>) => void;
  cancelDeleteSpace: () => void;
};

export function useAccountTabData(spaceId: string): UseAccountTabDataResult {
  const { data, loading } = useSpaceAccountQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  const space = data?.lookup.space;
  const platform = data?.platform;

  const url = space?.about.profile.url ?? '';
  const visibility = mapAccountVisibility(space?.visibility);
  const plan = space && platform ? mapAccountPlan(space, platform) : null;
  const host = space ? mapAccountHost(space) : null;
  const contactSupportHref = platform?.configuration.locations.support ?? '';
  // "Change License" routes users to the Alkemio contact page so the team can
  // walk them through plan changes — not a self-service plans list.
  const changeLicenseHref = platform?.configuration.locations.support ?? null;

  const privileges = space?.authorization?.myPrivileges ?? [];
  const canDeleteSpace = privileges.includes(AuthorizationPrivilege.Delete);

  const { t } = useTranslation('crd-spaceSettings');
  const notify = useNotification();
  // Spec 045 FR-024a: the deleted space's pages no longer exist, and a hard navigation also drops its
  // cached data. No success toast — notifications are in memory and would not survive the reload.
  const [pendingDeleteSpace, setPendingDeleteSpace] = useState(false);
  // The dialog stays open with a busy Confirm until the reload, so the delete cannot be sent twice.
  const [deleteSpace, { loading: deletingSpace }] = useDeleteSpaceMutation({
    onCompleted: () => window.location.replace(ROUTE_HOME),
    onError: () => {
      setPendingDeleteSpace(false);
      notify(t('account.dangerZone.deleteError'), 'error');
    },
  });

  const onDeleteSpace = () => {
    setPendingDeleteSpace(true);
  };

  const confirmDeleteSpace = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (deletingSpace) return;
    void deleteSpace({ variables: { spaceId } });
  };

  const cancelDeleteSpace = () => {
    if (deletingSpace) return;
    setPendingDeleteSpace(false);
  };

  const onCopyUrl = async (): Promise<boolean> => {
    if (!url) return false;
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  };

  return {
    url,
    plan,
    visibility,
    host,
    contactSupportHref,
    changeLicenseHref,
    canDeleteSpace,
    loading,
    onDeleteSpace,
    onCopyUrl,
    pendingDeleteSpace,
    deletingSpace,
    confirmDeleteSpace,
    cancelDeleteSpace,
  };
}
