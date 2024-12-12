import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent, DialogActions, Button } from '@mui/material';
import { AiPersonaBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import useInviteContributors from '@/domain/community/inviteContributors/useInviteContributors';
import { ContributorProps, InviteContributorDialogProps } from './InviteContributorsProps';
import InviteContributorsList from './InviteContributorsList';
import InviteVirtualContributorDialog from '../invitations/InviteVirtualContributorDialog';
import PreviewContributorDialog from './PreviewContributorDialog';
import VCProfileContentView from '../virtualContributor/vcProfilePage/VCProfileContentView';
import { VirtualContributorProfile } from '../virtualContributor/vcProfilePage/model';
import { BasicSpaceProps } from '../virtualContributor/components/BasicSpaceCard';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { gutters } from '@/core/ui/grid/utils';

const InviteVCsDialog = ({ open, onClose }: InviteContributorDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();

  const { spaceId, roleSetId } = useSpace();
  const { spaceLevel } = useRouteResolver();

  // data
  const {
    virtualContributors,
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    inviteExistingUser,
    onAddVirtualContributor,
    getBoKProfile,
    permissions,
    accountVCsLoading,
    libraryVCsLoading,
  } = useInviteContributors({ roleSetId, spaceId, spaceLevel });

  // state
  const [onAccount, setOnAccount] = useState<ContributorProps[]>();
  const [inLibrary, setInLibrary] = useState<ContributorProps[]>();
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [actionButtonDisabled, setActionButtonDisabled] = useState(false);
  const [action, setAction] = useState<'add' | 'invite'>();
  const [selectedVirtualContributorId, setSelectedVirtualContributorId] = useState<string>('');
  const [bokProfile, setBoKProfile] = useState<BasicSpaceProps>();

  const fetchVCs = async () => {
    let acc = await getAvailableVirtualContributors('', false);
    setOnAccount(acc);

    let lib = await getAvailableVirtualContributorsInLibrary('');
    setInLibrary(lib);
  };

  // on memberVCs change, update the lists of VCs
  useEffect(() => {
    fetchVCs();
  }, [virtualContributors]);

  const getContributorsBoKProfile = async () => {
    const vc = getContributorById(selectedVirtualContributorId);
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

    const vcBoK = await getContributorsBoKProfile();
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

  const onInviteClick = async () => {
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

  const showOnAccount = onAccount && onAccount.length > 0 && !accountVCsLoading;
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

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12}>
      <DialogContent>
        <Gutters disablePadding disableGap>
          {showOnAccount && (
            <PageContentBlockHeader title={t('components.inviteContributorsDialog.vcs.onAccount.title')} />
          )}
          {showOnAccount && <InviteContributorsList contributors={onAccount} onCardClick={onAccountContributorClick} />}
          {showOnAccount && (
            <Gutters disableGap disablePadding paddingTop={gutters()}>
              <PageContentBlockHeader title={t('components.inviteContributorsDialog.vcs.inLibrary.title')} />
            </Gutters>
          )}
          {libraryVCsLoading ? (
            <Loading />
          ) : (
            <InviteContributorsList contributors={inLibrary} onCardClick={onLibraryContributorClick} />
          )}
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
          onInviteUser={inviteExistingUser}
        />
      )}
      {openPreviewDialog && selectedContributor && (
        <PreviewContributorDialog
          open={openPreviewDialog}
          onClose={() => setOpenPreviewDialog(false)}
          contributor={selectedContributor}
          actions={renderActions()}
        >
          <VCProfileContentView
            bokProfile={bokProfile as unknown as BasicSpaceProps}
            virtualContributor={selectedContributor as unknown as VirtualContributorProfile}
          />
        </PreviewContributorDialog>
      )}
    </DialogWithGrid>
  );
};

export default InviteVCsDialog;
