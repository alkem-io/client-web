import { useState, useEffect, useCallback } from 'react';

import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { DialogContent, DialogActions, Button } from '@mui/material';

import { AiPersonaBodyOfKnowledgeType, RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
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
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import useRoleSetAdmin from '@/domain/access/RoleSetAdmin/useRoleSetAdmin';
import SearchField from '@/core/ui/search/SearchField';

const InviteVCsDialog = ({ open, onClose }: InviteContributorDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const { spaceId, roleSetId } = useSpace();
  const { spaceLevel } = useRouteResolver();

  const { virtualContributors } = useRoleSetAdmin({
    roleSetId,
    relevantRoles: [RoleName.Member],
    contributorTypes: [RoleSetContributorType.Virtual],
  });

  // data
  const {
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    inviteExistingUser,
    onAddVirtualContributor,
    getBoKProfile,
    permissions,
    availableVCsLoading,
  } = useInviteContributors({ roleSetId, spaceId, spaceLevel });

  // state
  const [filter, setFilter] = useState<string>('');
  const [onAccount, setOnAccount] = useState<ContributorProps[]>();
  const [inLibrary, setInLibrary] = useState<ContributorProps[]>();
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [actionButtonDisabled, setActionButtonDisabled] = useState(false);
  const [action, setAction] = useState<'add' | 'invite'>();
  const [selectedVirtualContributorId, setSelectedVirtualContributorId] = useState('');
  const [bokProfile, setBoKProfile] = useState<BasicSpaceProps>();

  const fetchVCs = async () => {
    let acc = await getAvailableVirtualContributors(filter, false);
    setOnAccount(acc);

    let lib = await getAvailableVirtualContributorsInLibrary(filter);
    setInLibrary(lib);
  };

  const memoizedFetchVCs = useCallback(fetchVCs, [
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
  ]);

  // debounce as we could have multiple changes in a short period of time
  const debouncedFetchVCs = debounce(fetchVCs, 100);

  const memoizedDebouncedFetchVCs = useCallback(debouncedFetchVCs, [memoizedFetchVCs]);

  // on memberVCs change, update the lists of VCs
  useEffect(() => {
    memoizedDebouncedFetchVCs();
  }, [virtualContributors, filter]); // do not add memoizedDebouncedFetchVCs in the dependencies

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
    return onAccount?.find(c => c.id === id) || inLibrary?.find(c => c.id === id);
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

  const showOnAccount = onAccount && onAccount.length > 0 && !availableVCsLoading;
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

  const isEmpty =
    (!onAccount || onAccount.length === 0) && (!inLibrary || inLibrary.length === 0) && !availableVCsLoading;

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12}>
      <DialogHeader icon={<VCIcon />} title={t('components.inviteContributorsDialog.title')} onClose={onClose} />

      <DialogContent>
        <Gutters disableGap disablePadding sx={{ display: 'flex' }}>
          <SearchField
            value={filter}
            sx={{ maxWidth: 400, marginLeft: 'auto' }}
            placeholder={t('community.virtualContributors.searchVC')}
            onChange={event => setFilter(event.target.value)}
          />
        </Gutters>

        <Gutters disablePadding disableGap>
          {showOnAccount && (
            <PageContentBlockHeader
              variant="caption"
              title={t('components.inviteContributorsDialog.vcs.onAccount.title')}
            />
          )}
          {showOnAccount && <InviteContributorsList contributors={onAccount} onCardClick={onAccountContributorClick} />}
          {showOnAccount && (
            <Gutters disableGap disablePadding paddingTop={gutters()}>
              <PageContentBlockHeader
                variant="caption"
                title={t('components.inviteContributorsDialog.vcs.inLibrary.title')}
              />
            </Gutters>
          )}
          {availableVCsLoading ? (
            <Loading />
          ) : (
            <InviteContributorsList contributors={inLibrary} onCardClick={onLibraryContributorClick} />
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
