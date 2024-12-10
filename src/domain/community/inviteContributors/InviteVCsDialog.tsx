import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent, DialogActions, Button } from '@mui/material';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import useInviteContributors from '@/domain/community/inviteContributors/useInviteContributors';
import { ContributorProps, InviteContributorDialogProps } from './InviteContributorsProps';
import InviteContributorsList from './InviteContributorsList';
import { PageTitle } from '@/core/ui/typography';
import InviteVirtualContributorDialog from '../invitations/InviteVirtualContributorDialog';

const InviteVCsDialog = ({ open, onClose }: InviteContributorDialogProps) => {
  const { t } = useTranslation();
  const { spaceId, roleSetId } = useSpace();

  const {
    virtualContributors,
    getAvailableVirtualContributors,
    getAvailableVirtualContributorsInLibrary,
    inviteExistingUser,
    onAddVirtualContributor,
  } = useInviteContributors({ roleSetId, spaceId, spaceLevel: SpaceLevel.Space });

  const [onAccount, setOnAccount] = useState<ContributorProps[]>();
  const [inLibrary, setInLibrary] = useState<ContributorProps[]>();
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [selectedVirtualContributorId, setSelectedVirtualContributorId] = useState<string>('');

  const fetchVCs = async () => {
    let acc = await getAvailableVirtualContributors('', false);
    setOnAccount(acc);

    let lib = await getAvailableVirtualContributorsInLibrary('');
    setInLibrary(lib);
  };

  useEffect(() => {
    fetchVCs();
  }, [virtualContributors]);

  const onContributorClick = (id: string) => {
    // todo: open preview dialog
    setOpenInviteDialog(true);
    setSelectedVirtualContributorId(id);
  };

  const hasOnAccount = onAccount && onAccount.length > 0;

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12}>
      <DialogHeader>{t('pages.contributors.virtualContributors.title')}</DialogHeader>
      <DialogContent>
        <Gutters disablePadding disableGap>
          {hasOnAccount && <PageTitle>Virtual Contributors from my account</PageTitle>}
          {hasOnAccount && <InviteContributorsList contributors={onAccount} onCardClick={onAddVirtualContributor} />}
          {hasOnAccount && <PageTitle>Other Virtual Contributors</PageTitle>}
          <InviteContributorsList contributors={inLibrary} onCardClick={onContributorClick} />
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
    </DialogWithGrid>
  );
};

export default InviteVCsDialog;
