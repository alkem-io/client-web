import { useMemo, useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { DialogContent, DialogActions, Button } from '@mui/material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useSpace } from '@/domain/space/context/useSpace';
import VCIcon from '@/domain/community/virtualContributor/VirtualContributorsIcons';
import { ContributorProps, InviteContributorsDialogProps } from '../InviteContributorsProps';
import InviteContributorsList from './InviteContributorsList';
import InviteVirtualContributorDialog from './InviteVirtualContributorDialog';
import PreviewContributorDialog, { ProviderProfile } from './PreviewContributorDialog';
import VCProfileContentView from '../../virtualContributor/vcProfilePage/VCProfileContentView';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import SearchField from '@/core/ui/search/SearchField';
import useCommunityAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';
import useVirtualContributorsAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useVirtualContributorsAdmin';
import ProfileDetail from '@/domain/community/profile/ProfileDetail/ProfileDetail';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { useVirtualContributorProviderLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { createVirtualContributorModelFull } from '../../virtualContributor/utils/createVirtualContributorModelFull';

const InviteVCsDialog = ({ open, onClose }: InviteContributorsDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const { space } = useSpace();
  const { about, level } = space;
  const roleSetId = about?.membership!.roleSetID!;

  const [getVcProvider] = useVirtualContributorProviderLazyQuery();

  const {
    virtualContributorAdmin: { members: virtualContributors, onAdd: onAddVirtualContributor, inviteContributors },
    permissions,
    loading,
  } = useCommunityAdmin({ roleSetId });

  const {
    virtualContributorAdmin: {
      getAvailable: getAvailableVirtualContributors,
      getAvailableInLibrary: getAvailableVirtualContributorsInLibrary,
    },
  } = useVirtualContributorsAdmin({ level, currentMembers: virtualContributors, spaceId: space.id });

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
  const [selectedVirtualContributor, setSelectedVirtualContributor] = useState<ContributorProps>();
  const [selectedVcProvider, setSelectedVcProvider] = useState<ProviderProfile>();

  const getProvider = async (vcId: string) => {
    const providerData = await getVcProvider({
      variables: {
        id: vcId,
      },
    });

    setSelectedVcProvider(providerData?.data?.lookup.virtualContributor?.provider?.profile);
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

  const onContributorClick = async (id: string) => {
    setSelectedVirtualContributor(getContributorById(id));
    setActionButtonDisabled(false);
    setOpenPreviewDialog(true);
  };

  const onAddClick = async () => {
    if (!selectedVirtualContributor?.id) {
      return;
    }

    setActionButtonDisabled(true);

    try {
      await onAddVirtualContributor(selectedVirtualContributor.id);

      notify(
        t('community.invitations.inviteContributorsDialog.vcs.successfullyAdded', {
          contributor: t('community.virtualContributor'),
        }),
        'success'
      );
      setOpenPreviewDialog(false);
    } catch (error) {
      console.error('Error adding virtual contributor:', error);
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
    setSelectedVirtualContributor(undefined);
  };

  const showOnAccount = (filteredOnAccount ?? onAccount).length > 0 && !loading;
  const availableActions =
    (permissions?.canAddVirtualContributors || permissions?.canAddVirtualContributorsFromAccount) &&
    !actionButtonDisabled;

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
          getAvailableVirtualContributors(undefined),
          getAvailableVirtualContributorsInLibrary(undefined),
        ]);

        const accountVCIds = new Set(accountVCs.map(vc => vc.id));
        const filteredLibraryVCs = libraryVCs?.filter(vc => !accountVCIds.has(vc.id));

        setOnAccount(accountVCs);
        setInLibrary(filteredLibraryVCs);
      } catch (_error) {
        // TODO: should we not be showing the error message?
        notify(t('community.invitations.inviteContributorsDialog.vcs.vcFetchErrorMessage'), 'error');
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
    !loading;

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12} aria-labelledby="invite-vcs-dialog">
      <DialogHeader
        id="invite-vcs-dialog"
        icon={<VCIcon />}
        title={t('community.invitations.inviteContributorsDialog.vcs.title')}
        onClose={onClose}
      />

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
              title={t('community.invitations.inviteContributorsDialog.vcs.onAccount.title')}
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
                title={t('community.invitations.inviteContributorsDialog.vcs.inLibrary.title')}
              />
            </Gutters>
          )}

          {loading ? (
            <Loading />
          ) : (
            <InviteContributorsList
              contributors={filteredInLibrary ?? inLibrary}
              onCardClick={onLibraryContributorClick}
            />
          )}
          {isEmpty && <Caption>{t('community.invitations.inviteContributorsDialog.vcs.emptyMessage')}</Caption>}
        </Gutters>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('buttons.close')}
        </Button>
      </DialogActions>
      {openInviteDialog && selectedVirtualContributor?.id && (
        <InviteVirtualContributorDialog
          title={t('community.invitations.inviteContributorsDialog.vcs.dialogTitle')}
          spaceDisplayName={about?.profile.displayName ?? ''}
          open={openInviteDialog}
          onClose={onCloseInvite}
          contributorId={selectedVirtualContributor.id!}
          onInviteVirtualContributor={inviteData => inviteContributors({ ...inviteData })}
        />
      )}
      {openPreviewDialog && selectedVirtualContributor && (
        <PreviewContributorDialog
          open={openPreviewDialog}
          onClose={() => setOpenPreviewDialog(false)}
          contributor={selectedVirtualContributor}
          provider={selectedVcProvider}
          actions={renderActions()}
          getProvider={getProvider}
        >
          {Boolean(selectedVirtualContributor?.profile?.description) && (
            <PageContentBlock disableGap>
              <ProfileDetail
                title={t('components.profile.fields.description.title')}
                value={selectedVirtualContributor?.profile?.description}
                aria-label="description"
              />
            </PageContentBlock>
          )}
          <VCProfileContentView virtualContributor={createVirtualContributorModelFull(selectedVirtualContributor)} />
        </PreviewContributorDialog>
      )}
    </DialogWithGrid>
  );
};

export default InviteVCsDialog;
