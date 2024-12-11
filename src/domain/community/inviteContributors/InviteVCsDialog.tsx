import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent, DialogActions, Button } from '@mui/material';
import { AiPersonaBodyOfKnowledgeType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import useInviteContributors from '@/domain/community/inviteContributors/useInviteContributors';
import { ContributorProps, InviteContributorDialogProps } from './InviteContributorsProps';
import InviteContributorsList from './InviteContributorsList';
import { PageTitle } from '@/core/ui/typography';
import InviteVirtualContributorDialog from '../invitations/InviteVirtualContributorDialog';
import PreviewContributorDialog from './PreviewContributorDialog';
import VCProfileContentView from '../virtualContributor/vcProfilePage/VCProfileContentView';
import { VirtualContributorProfile } from '../virtualContributor/vcProfilePage/model';
import { BasicSpaceProps } from '../virtualContributor/components/BasicSpaceCard';
import Loading from '@/core/ui/loading/Loading';

const InviteVCsDialog = ({ open, onClose }: InviteContributorDialogProps) => {
  const { t } = useTranslation();
  const { spaceId, roleSetId } = useSpace();

  const {
    virtualContributors,
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    inviteExistingUser,
    onAddVirtualContributor,
    getBoKProfile,
    bokProfileLoading,
  } = useInviteContributors({ roleSetId, spaceId, spaceLevel: SpaceLevel.Space });

  const [onAccount, setOnAccount] = useState<ContributorProps[]>();
  const [inLibrary, setInLibrary] = useState<ContributorProps[]>();
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [action, setAction] = useState<'add' | 'invite'>();
  const [selectedVirtualContributorId, setSelectedVirtualContributorId] = useState<string>('');
  const [bokProfile, setBoKProfile] = useState<BasicSpaceProps>();

  const fetchVCs = async () => {
    let acc = await getAvailableVirtualContributors('', false);
    setOnAccount(acc);

    let lib = await getAvailableVirtualContributorsInLibrary('');
    setInLibrary(lib);
  };

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

  const onInviteClick = async () => {
    await onAddVirtualContributor(selectedVirtualContributorId);
    // todo: notify
    setOpenPreviewDialog(false);
  };

  const hasOnAccount = onAccount && onAccount.length > 0;

  const selectedContributor = selectedVirtualContributorId
    ? getContributorById(selectedVirtualContributorId)
    : undefined;

  // todo:b add checks for privileges on the Actions

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12}>
      <DialogContent>
        <Gutters disablePadding disableGap>
          {hasOnAccount && <PageTitle>Virtual Contributors from my account</PageTitle>}
          {hasOnAccount && <InviteContributorsList contributors={onAccount} onCardClick={onAccountContributorClick} />}
          {hasOnAccount && <PageTitle>Other Virtual Contributors</PageTitle>}
          <InviteContributorsList contributors={inLibrary} onCardClick={onLibraryContributorClick} />
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
          onClose={() => setOpenInviteDialog(false)}
          contributorId={selectedVirtualContributorId}
          onInviteUser={inviteExistingUser}
        />
      )}
      {openPreviewDialog && selectedContributor && (
        <PreviewContributorDialog
          open={openPreviewDialog}
          onClose={() => setOpenPreviewDialog(false)}
          contributor={selectedContributor}
          actions={
            <>
              {action === 'add' && (
                <Button variant="contained" onClick={onInviteClick}>
                  {t('common.add')}
                </Button>
              )}
              {action === 'invite' && (
                <Button variant="contained" onClick={() => setOpenInviteDialog(true)}>
                  {t('buttons.invite')}
                </Button>
              )}
            </>
          }
        >
          {bokProfileLoading && <Loading />}
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
