import { useEffect, useState } from 'react';
import type { AddCommunityMemberCandidate } from '@/crd/components/space/settings/AddCommunityMemberDialog';
import type useCommunityAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';
import useVirtualContributorsAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useVirtualContributorsAdmin';
import type { SpaceCommunityCandidate } from '@/domain/spaceAdmin/SpaceAdminCommunity/native/spaceCommunityNative';

export type AddCommunityMemberDialogState = {
  open: boolean;
  search: string;
  candidates: AddCommunityMemberCandidate[];
  loading: boolean;
  addedIds: ReadonlySet<string>;
  addingId: string | null;
  openDialog: () => void;
  closeDialog: () => void;
  onSearchChange: (next: string) => void;
  onAdd: (id: string) => Promise<void>;
};

const toCandidate = (candidate: SpaceCommunityCandidate): AddCommunityMemberCandidate => ({
  id: candidate.id,
  displayName: candidate.displayName,
  email: null,
  avatarUrl: candidate.avatarUrl ?? null,
});

/**
 * Drives the CRD "Add Virtual Contributor" dialog. Uses
 * `useVirtualContributorsAdmin.virtualContributorAdmin.getAvailable`
 * (`candidates(entry: DIRECT)`) for candidates and `community.virtualContributorAdmin.onAdd`
 * (`setRoles`) for the mutation.
 */
export function useAddVirtualContributorDialog({
  community,
  spaceId,
}: {
  community: ReturnType<typeof useCommunityAdmin>;
  spaceId: string;
}): AddCommunityMemberDialogState {
  const vcAdmin = useVirtualContributorsAdmin({ spaceId });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<AddCommunityMemberCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  const loadCandidates = async (filter: string | undefined) => {
    setLoading(true);
    try {
      const available = await vcAdmin.virtualContributorAdmin.getAvailable(filter);
      setCandidates(available.map(toCandidate));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void loadCandidates(search.trim() || undefined);
  }, [open, search]);

  const openDialog = () => {
    setAddedIds(new Set());
    setSearch('');
    setOpen(true);
  };
  const closeDialog = () => setOpen(false);
  const onSearchChange = (next: string) => setSearch(next);

  const onAdd = async (id: string) => {
    setAddingId(id);
    try {
      await community.virtualContributorAdmin.onAdd(id);
      setAddedIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      await loadCandidates(search.trim() || undefined);
    } finally {
      setAddingId(null);
    }
  };

  return { open, search, candidates, loading, addedIds, addingId, openDialog, closeDialog, onSearchChange, onAdd };
}

// `useAddVirtualContributorExternalDialog` was removed: the settings "Invite
// External Virtual Contributor" entry now uses `InviteMembersDialogConnector`
// with kind="virtualContributor" (library list + welcome-message step after
// selection), matching MUI's `InviteVCsDialog` → `InviteVirtualContributorDialog`
// flow instead of an inline message on the picker.

// `useInviteUsersDialog` (the stripped member-invite hook) was removed: the
// settings Community tab now uses the parity-complete `InviteMembersDialogConnector`
// (single live-detect input + welcome message + role selection). VC add/invite
// hooks below remain in use.
