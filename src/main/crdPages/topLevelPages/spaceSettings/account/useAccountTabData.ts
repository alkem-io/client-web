import { useState } from 'react';
import { useDeleteSpaceMutation, useSpaceAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type { AccountHost, AccountPlan } from '@/crd/components/space/settings/SpaceSettingsAccountView';
import { mapAccountHost, mapAccountPlan } from './accountMapper';

export type UseAccountTabDataResult = {
  url: string;
  plan: AccountPlan | null;
  visibility: string;
  host: AccountHost | null;
  contactSupportHref: string;
  changeLicenseHref: string | null;
  canDeleteSpace: boolean;
  loading: boolean;
  onDeleteSpace: () => void;
  onCopyUrl: () => Promise<boolean>;
  pendingDeleteSpace: boolean;
  confirmDeleteSpace: () => void;
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
  const visibility = space?.visibility ?? '';
  const plan = space && platform ? mapAccountPlan(space, platform) : null;
  const host = space ? mapAccountHost(space) : null;
  const contactSupportHref = platform?.configuration.locations.support ?? '';
  // "Change License" routes users to the Alkemio contact page so the team can
  // walk them through plan changes — not a self-service plans list.
  const changeLicenseHref = platform?.configuration.locations.support ?? null;

  const privileges = space?.authorization?.myPrivileges ?? [];
  const canDeleteSpace = privileges.includes(AuthorizationPrivilege.Delete);

  const [deleteSpace] = useDeleteSpaceMutation();
  const [pendingDeleteSpace, setPendingDeleteSpace] = useState(false);

  const onDeleteSpace = () => {
    setPendingDeleteSpace(true);
  };

  const confirmDeleteSpace = () => {
    void deleteSpace({ variables: { spaceId } });
    setPendingDeleteSpace(false);
  };

  const cancelDeleteSpace = () => {
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
    confirmDeleteSpace,
    cancelDeleteSpace,
  };
}
