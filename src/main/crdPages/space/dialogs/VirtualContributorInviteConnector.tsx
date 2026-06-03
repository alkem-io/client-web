import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  type VcInviteItem,
  VirtualContributorInviteDialog,
} from '@/crd/components/community/VirtualContributorInviteDialog';
import useCommunityAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';
import useVirtualContributorsAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useVirtualContributorsAdmin';

export type VirtualContributorInviteConnectorProps = {
  open: boolean;
  onClose: () => void;
  roleSetId: string;
  spaceId: string;
  spaceLevel: SpaceLevel;
  spaceName: string;
  /** When true, only library VCs are listed (the account-add lives on a separate button). */
  libraryOnly?: boolean;
};

const SEARCH_DEBOUNCE_MS = 300;

const toItem = (vc: { id: string; profile?: { displayName: string } }): VcInviteItem => ({
  id: vc.id,
  displayName: vc.profile?.displayName ?? '',
});

/**
 * Wires the combined `VirtualContributorInviteDialog` to the community admin
 * hooks: account VCs are added directly (`virtualContributorAdmin.onAdd`),
 * library VCs are invited with a welcome message
 * (`virtualContributorAdmin.inviteContributors`). Mirrors the MUI `InviteVCsDialog`
 * reached from the space Community page Virtual Contributors block.
 */
export function VirtualContributorInviteConnector({
  open,
  onClose,
  roleSetId,
  spaceId,
  spaceLevel,
  spaceName,
  libraryOnly = false,
}: VirtualContributorInviteConnectorProps) {
  const { t } = useTranslation('crd-community');
  const notify = useNotification();

  const community = useCommunityAdmin({ roleSetId });
  const { virtualContributorAdmin: lookup } = useVirtualContributorsAdmin({
    level: spaceLevel,
    spaceId,
    currentMembers: community.virtualContributorAdmin.members,
  });

  const [search, setSearch] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [accountVcs, setAccountVcs] = useState<VcInviteItem[]>([]);
  const [libraryVcs, setLibraryVcs] = useState<VcInviteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(search), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [search]);

  // `lookup` is intentionally excluded from deps — useVirtualContributorsAdmin
  // returns a fresh object each render, so including it would re-fetch on every
  // render. Mirrors the existing settings VC dialog hooks.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const [account, library] = await Promise.all([
          libraryOnly ? Promise.resolve([]) : lookup.getAvailable(debouncedQuery || undefined),
          lookup.getAvailableInLibrary(debouncedQuery || undefined),
        ]);
        if (cancelled) return;
        setAccountVcs(account.map(toItem));
        setLibraryVcs(library.map(toItem));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, debouncedQuery]);

  const handleAddAccountVc = async (id: string) => {
    setBusyId(id);
    try {
      await community.virtualContributorAdmin.onAdd(id);
      notify(t('inviteVc.addedNotice'), 'success');
      onClose();
    } catch {
      notify(t('inviteVc.error'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleInviteLibraryVc = async (id: string, welcomeMessage: string) => {
    setBusyId(id);
    try {
      await community.virtualContributorAdmin.inviteContributors({
        welcomeMessage,
        invitedContributorIds: [id],
        invitedUserEmails: [],
      });
      notify(t('inviteVc.invitedNotice'), 'success');
      onClose();
    } catch {
      notify(t('inviteVc.error'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <VirtualContributorInviteDialog
      open={open}
      onOpenChange={next => {
        if (!next) {
          setSearch('');
          setDebouncedQuery('');
          onClose();
        }
      }}
      searchQuery={search}
      onSearchChange={setSearch}
      accountVcs={accountVcs}
      libraryVcs={libraryVcs}
      onAddAccountVc={handleAddAccountVc}
      onInviteLibraryVc={handleInviteLibraryVc}
      loading={loading}
      busyId={busyId}
      defaultWelcomeMessage={t('inviteVc.defaultWelcomeMessage', { space: spaceName })}
      libraryOnly={libraryOnly}
    />
  );
}
