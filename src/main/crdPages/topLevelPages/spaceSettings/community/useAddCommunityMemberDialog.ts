import { useEffect, useState } from 'react';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import type { AddCommunityMemberCandidate } from '@/crd/components/space/settings/AddCommunityMemberDialog';
import type useCommunityAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';
import useVirtualContributorsAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useVirtualContributorsAdmin';

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

type EntityLike = {
  id: string;
  email?: string | null;
  profile?: { displayName?: string | null; avatar?: { uri?: string | null } | null } | null;
};

const toCandidate = (entity: EntityLike): AddCommunityMemberCandidate => ({
  id: entity.id,
  displayName: entity.profile?.displayName ?? '',
  email: entity.email ?? null,
  avatarUrl: entity.profile?.avatar?.uri ?? null,
});

/**
 * Drives the CRD "Add Organization" dialog. Wraps
 * `useCommunityAdmin().organizationAdmin.getAvailable` + `onAdd`, mirroring the
 * MUI `CommunityOrganizations` / `CommunityAddMembersDialog` flow.
 */
export function useAddOrganizationDialog({
  community,
}: {
  community: ReturnType<typeof useCommunityAdmin>;
}): AddCommunityMemberDialogState {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<AddCommunityMemberCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  const loadCandidates = async (filter: string | undefined) => {
    setLoading(true);
    try {
      const available = await community.organizationAdmin.getAvailable(filter);
      setCandidates(available.map(toCandidate));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void loadCandidates(search.trim() || undefined);
    // eslint-disable-next-line react-compiler/react-compiler
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
      await community.organizationAdmin.onAdd(id);
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

/**
 * Drives the CRD "Add Virtual Contributor" dialog. Uses
 * `useVirtualContributorsAdmin.virtualContributorAdmin.getAvailable`
 * (account-scoped) for candidates and `community.virtualContributorAdmin.onAdd`
 * for the mutation.
 */
export function useAddVirtualContributorDialog({
  community,
  spaceId,
  spaceLevel,
}: {
  community: ReturnType<typeof useCommunityAdmin>;
  spaceId: string;
  spaceLevel: SpaceLevel | undefined;
}): AddCommunityMemberDialogState {
  const vcAdmin = useVirtualContributorsAdmin({
    level: spaceLevel ?? SpaceLevel.L0,
    currentMembers: community.virtualContributorAdmin.members,
    spaceId,
  });

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
    // eslint-disable-next-line react-compiler/react-compiler
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

/**
 * Drives the CRD "Invite External Virtual Contributor" dialog. Uses the
 * library-scoped `getAvailableInLibrary` query for candidates; picking one
 * fires `virtualContributorAdmin.inviteContributors` (an invitation, not a
 * direct add — external VCs require the owner's acceptance).
 */
export function useAddVirtualContributorExternalDialog({
  community,
  spaceId,
  spaceLevel,
}: {
  community: ReturnType<typeof useCommunityAdmin>;
  spaceId: string;
  spaceLevel: SpaceLevel | undefined;
}): AddCommunityMemberDialogState {
  const vcAdmin = useVirtualContributorsAdmin({
    level: spaceLevel ?? SpaceLevel.L0,
    currentMembers: community.virtualContributorAdmin.members,
    spaceId,
  });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<AddCommunityMemberCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  const loadCandidates = async (filter: string | undefined) => {
    setLoading(true);
    try {
      const available = await vcAdmin.virtualContributorAdmin.getAvailableInLibrary(filter);
      setCandidates(available.map(toCandidate));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void loadCandidates(search.trim() || undefined);
    // eslint-disable-next-line react-compiler/react-compiler
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
      await community.virtualContributorAdmin.inviteContributors({
        welcomeMessage: '',
        invitedContributorIds: [id],
        invitedUserEmails: [],
      });
      setAddedIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    } finally {
      setAddingId(null);
    }
  };

  return { open, search, candidates, loading, addedIds, addingId, openDialog, closeDialog, onSearchChange, onAdd };
}

/**
 * Drives the CRD "Invite Members" dialog. Lists users NOT already in the role
 * set (`userAdmin.getAvailable`); adding a row fires `userAdmin.inviteContributors`.
 * External email invitations share the same mutation shape.
 */
export function useInviteUsersDialog({
  community,
}: {
  community: ReturnType<typeof useCommunityAdmin>;
}): AddCommunityMemberDialogState & {
  inviteByEmail: (email: string) => Promise<void>;
  inviting: boolean;
} {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<AddCommunityMemberCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  const loadCandidates = async (filter: string | undefined) => {
    setLoading(true);
    try {
      const available = await community.userAdmin.getAvailable(filter);
      setCandidates(available.map(toCandidate));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void loadCandidates(search.trim() || undefined);
    // eslint-disable-next-line react-compiler/react-compiler
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
      await community.userAdmin.inviteContributors({
        welcomeMessage: '',
        invitedContributorIds: [id],
        invitedUserEmails: [],
      });
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

  const inviteByEmail = async (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setInviting(true);
    try {
      await community.userAdmin.inviteContributors({
        welcomeMessage: '',
        invitedContributorIds: [],
        invitedUserEmails: [trimmed],
      });
    } finally {
      setInviting(false);
    }
  };

  return {
    open,
    search,
    candidates,
    loading,
    addedIds,
    addingId,
    openDialog,
    closeDialog,
    onSearchChange,
    onAdd,
    inviteByEmail,
    inviting,
  };
}
