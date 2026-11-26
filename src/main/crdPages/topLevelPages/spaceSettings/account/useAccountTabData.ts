import { useState } from 'react';
import { NotFoundError } from '@/core/40XErrorHandler/40XErrors';
import {
  useSpaceSettingsAccountQuery,
  useSpaceSettingsDeleteSpaceMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import type { AccountHost, AccountPlan } from '@/crd/components/space/settings/SpaceSettingsAccountView';
import { useConfig } from '@/domain/platform/config/useConfig';
import { type AccountSpace, mapAccountHost, mapAccountPlan } from './accountMapper';

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
  const { data, loading, error } = useSpaceSettingsAccountQuery({
    variables: { id: spaceId },
    skip: !spaceId,
  });
  if (spaceId && error) throw error;
  if (spaceId && data && !loading && !data.node) throw new NotFoundError();

  const space =
    data?.node?.id === spaceId && data.node.entityType === 'space' ? (data.node as AccountSpace) : undefined;
  // The support location is the native Config.links `support` entry, served through the config context.
  const { locations } = useConfig();

  const url = space?.url ?? '';
  // Space.status carries the legacy visibility values (ACTIVE, ARCHIVED, DEMO, INACTIVE).
  const visibility = space?.status ?? '';
  const plan = space ? mapAccountPlan(space) : null;
  const host = space ? mapAccountHost(space) : null;
  const contactSupportHref = locations?.support ?? '';
  // "Change License" routes users to the Alkemio contact page so the team can
  // walk them through plan changes — not a self-service plans list.
  const changeLicenseHref = locations?.support ?? null;

  const canDeleteSpace = space?.can.delete ?? false;

  const handleError = useApolloErrorHandler();
  const [deleteSpace] = useSpaceSettingsDeleteSpaceMutation({ onError: handleError });
  const [pendingDeleteSpace, setPendingDeleteSpace] = useState(false);

  const onDeleteSpace = () => {
    setPendingDeleteSpace(true);
  };

  const confirmDeleteSpace = () => {
    void deleteSpace({ variables: { id: spaceId } });
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
