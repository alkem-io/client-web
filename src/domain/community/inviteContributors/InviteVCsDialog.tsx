import { useMemo, useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { DialogContent, DialogActions, Button } from '@mui/material';
import { AiPersonaBodyOfKnowledgeType, RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useSpace } from '@/domain/space/SpaceContext/useSpace';
import useInviteContributors from '@/domain/access/_removeMe/useInviteContributors';
import VCIcon from '@/domain/community/virtualContributor/VirtualContributorsIcons';
import { ContributorProps, InviteContributorDialogProps } from './InviteContributorsProps';
import InviteContributorsList from './InviteContributorsList';
import InviteVirtualContributorDialog from '../invitations/InviteVirtualContributorDialog';
import PreviewContributorDialog from './PreviewContributorDialog';
import VCProfileContentView from '../virtualContributor/vcProfilePage/VCProfileContentView';
import { BasicSpaceProps } from '../virtualContributor/components/BasicSpaceCard';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import SearchField from '@/core/ui/search/SearchField';

const InviteVCsDialog = ({ open, onClose }: InviteContributorDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const { spaceId, spaceLevel, loading: urlResolverLoading } = useUrlResolver();
  const { space } = useSpace();
  const roleSetId = space?.about.membership?.roleSetID!;

  const { virtualContributors } = useRoleSetManager({
    roleSetId,
    relevantRoles: [RoleName.Member],
    contributorTypes: [RoleSetContributorType.Virtual],
    fetchContributors: true,
  });

  const {
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    inviteExistingUser,
    onAddVirtualContributor,
    getBoKProfile,
    permissions,
    availableVCsLoading,
  } = useInviteContributors({ roleSetId, spaceId, spaceLevel });

  const [filter, setFilter] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isFilterPristine, setIsFilterPristine] = useState(true);
  const [onAccount, setOnAccount] = useState<ContributorProps[]>([]);
  const [inLibrary, setInLibrary] = useState<ContributorProps[]>([]);
  const [filteredOnAccount, setFilteredOnAccount] = useState<ContributorProps[]>();
  const [filteredInLibrary, setFilteredInLibrary] = useState<ContributorProps[]>();
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [actionButtonDisabled, setActionButtonDisabled] = useState(false);
  const [action, setAction] = useState<'add' | 'invite'>();
  const [selectedVirtualContributorId, setSelectedVirtualContributorId] = useState('');
  const [bokProfile, setBoKProfile] = useState<BasicSpaceProps>();

  const getContributorsBoKProfile = async (vcId: string) => {
    const vc = getContributorById(vcId);
    const isBoKSpace = vc?.aiPersona?.bodyOfKnowledgeType === AiPersonaBodyOfKnowledgeType.AlkemioSpace;
    const bodyOfKnowledgeID = vc?.aiPersona?.bodyOfKnowledgeID;

    if (!isBoKSpace || !bodyOfKnowledgeID) {
      return undefined;
    }

    return await getBoKProfile(bodyOfKnowledgeID);
  };

  const onContributorClick = async (id: string) => {
    setSelectedVirtualContributorId(id);
    setActionButtonDisabled(false);
    setOpenPreviewDialog(true);

    const vcBoK = await getContributorsBoKProfile(id);
    setBoKProfile(vcBoK);
  };

  const onAccountContributorClick = (id: string) => {
    setAction('add');
    onContributorClick(id);
  };

  const onLibraryContributorClick = (id: string) => {
    setAction('invite');
    onContributorClick(id);
  };

  const getContributorById = (id: string) => {
    return (
      (filteredOnAccount ?? onAccount)?.find(c => c.id === id) ||
      (filteredInLibrary ?? inLibrary)?.find(c => c.id === id)
    );
  };

  const onAddClick = async () => {
    setActionButtonDisabled(true);
    const result = await onAddVirtualContributor(selectedVirtualContributorId);

    if (result) {
      notify(
        t('components.inviteContributorsDialog.successfullyAdded', {
          contributor: t('community.virtualContributor'),
        }),
        'success'
      );
      setOpenPreviewDialog(false);
    }
  };

  const onInviteClick = () => {
    setActionButtonDisabled(true);
    setOpenInviteDialog(true);
  };

  const onCloseInvite = () => {
    setActionButtonDisabled(false);
    setOpenInviteDialog(false);
    setOpenPreviewDialog(false);
  };

  const selectedContributor = selectedVirtualContributorId
    ? getContributorById(selectedVirtualContributorId)
    : undefined;

  const isLoading = availableVCsLoading || urlResolverLoading;
  const showOnAccount = (filteredOnAccount ?? onAccount).length > 0 && !isLoading;
  const availableActions =
    (permissions?.canAddMembers || permissions?.canAddVirtualContributorsFromAccount) && !actionButtonDisabled;

  const renderActions = () => (
    <>
      {action === 'add' && (
        <Button variant="contained" disabled={!availableActions} onClick={onAddClick}>
          {t('common.add')}
        </Button>
      )}

      {action === 'invite' && (
        <Button variant="contained" disabled={!availableActions} onClick={onInviteClick}>
          {t('buttons.invite')}
        </Button>
      )}
    </>
  );

  const debouncedSetFilter = useMemo(
    () =>
      debounce((value: string) => {
        setFilter(value);
      }, 300),
    []
  );

  // When `inputValue` changes, we update `filter` with delay. Do not use debouncing directly on the `onChange` prop since it will apply the delay
  // on every key press, which will cause the input to lag.
  useEffect(() => {
    debouncedSetFilter(inputValue);

    return () => {
      debouncedSetFilter.cancel();
    };
  }, [inputValue, debouncedSetFilter]);

  useEffect(() => {
    const fetchVirtualContributors = async () => {
      try {
        const [accountVCs, libraryVCs] = await Promise.all([
          getAvailableVirtualContributors(undefined, false),
          getAvailableVirtualContributorsInLibrary(undefined),
        ]);

        const accountVCIds = new Set(accountVCs.map(vc => vc.id));
        const filteredLibraryVCs = libraryVCs?.filter(vc => !accountVCIds.has(vc.id));

        setOnAccount(accountVCs);
        setInLibrary(filteredLibraryVCs);
      } catch (error) {
        notify(t('components.inviteContributorsDialog.vcFetchErrorMessage'), 'error');
      }
    };

    fetchVirtualContributors();
  }, [virtualContributors]);

  const memoizedFilteredOnAccount = useMemo(
    () =>
      filter
        ? onAccount?.filter(acc => acc.profile.displayName.toLowerCase().includes(filter.toLowerCase()))
        : undefined,
    [filter, onAccount]
  );

  const memoizedFilteredInLibrary = useMemo(
    () =>
      filter
        ? inLibrary?.filter(lib => lib.profile.displayName.toLowerCase().includes(filter.toLowerCase()))
        : undefined,
    [filter, inLibrary]
  );

  useEffect(() => {
    if (filter) {
      setFilteredOnAccount(memoizedFilteredOnAccount);
      setFilteredInLibrary(memoizedFilteredInLibrary);
    } else if (!isFilterPristine) {
      setFilteredOnAccount(undefined);
      setFilteredInLibrary(undefined);
    }
  }, [filter, isFilterPristine, memoizedFilteredOnAccount, memoizedFilteredInLibrary]);

  const availableOnAccount = onAccount ?? filteredOnAccount;
  const availableInLibrary = inLibrary ?? filteredInLibrary;
  const isEmpty =
    (!availableOnAccount || availableOnAccount.length === 0) &&
    (!availableInLibrary || availableInLibrary.length === 0) &&
    !isLoading;

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12}>
      <DialogHeader icon={<VCIcon />} title={t('components.inviteContributorsDialog.title')} onClose={onClose} />

      <DialogContent>
        <Gutters disableGap disablePadding sx={{ display: 'flex' }}>
          <SearchField
            value={inputValue}
            sx={{ maxWidth: 400, marginLeft: 'auto' }}
            placeholder={t('community.virtualContributors.searchVC')}
            onChange={event => {
              setInputValue(event.target.value);
              isFilterPristine && setIsFilterPristine(false);
            }}
          />
        </Gutters>

        <Gutters disablePadding disableGap>
          {showOnAccount && (
            <PageContentBlockHeader
              variant="caption"
              title={t('components.inviteContributorsDialog.vcs.onAccount.title')}
            />
          )}
          {showOnAccount && (
            <InviteContributorsList
              contributors={filteredOnAccount ?? onAccount}
              onCardClick={onAccountContributorClick}
            />
          )}
          {showOnAccount && (
            <Gutters disableGap disablePadding paddingTop={gutters()}>
              <PageContentBlockHeader
                variant="caption"
                title={t('components.inviteContributorsDialog.vcs.inLibrary.title')}
              />
            </Gutters>
          )}

          {isLoading ? (
            <Loading />
          ) : (
            <InviteContributorsList
              contributors={filteredInLibrary ?? inLibrary}
              onCardClick={onLibraryContributorClick}
            />
          )}
          {isEmpty && <Caption>{t('components.inviteContributorsDialog.vcs.emptyMessage')}</Caption>}
        </Gutters>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('buttons.close')}
        </Button>
      </DialogActions>
      {openInviteDialog && selectedVirtualContributorId && (
        <InviteVirtualContributorDialog
          title={t('components.invitations.inviteExistingVCDialog.title')}
          spaceDisplayName={''}
          open={openInviteDialog}
          onClose={onCloseInvite}
          contributorId={selectedVirtualContributorId}
          onInviteUser={inviteData => inviteExistingUser({ roleSetId, ...inviteData })}
        />
      )}
      {openPreviewDialog && selectedContributor && (
        <PreviewContributorDialog
          open={openPreviewDialog}
          onClose={() => setOpenPreviewDialog(false)}
          contributor={selectedContributor}
          actions={renderActions()}
        >
          <VCProfileContentView bokProfile={bokProfile} virtualContributor={selectedContributor} />
        </PreviewContributorDialog>
      )}
    </DialogWithGrid>
  );
};

export default InviteVCsDialog;
