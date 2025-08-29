import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import SeeMore from '@/core/ui/content/SeeMore';
import Loading from '@/core/ui/loading/Loading';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import Avatar from '@/core/ui/avatar/Avatar';
import { BlockSectionTitle } from '@/core/ui/typography';
import RouterLink from '@/core/ui/link/RouterLink';
import VirtualContributorsDialog, { VirtualContributorProps } from './VirtualContributorsDialog';
import VCIcon from '@/domain/community/virtualContributor/VirtualContributorsIcons';
import Gutters from '@/core/ui/grid/Gutters';
import { DashboardAddButton } from '@/domain/shared/components/DashboardSections/DashboardAddButton';
import InviteContributorsDialog from '@/domain/community/inviteContributors/InviteContributorsDialog';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';

export const VIRTUAL_CONTRIBUTORS_LIMIT = 3;

type VirtualContributorsBlockProps = {
  virtualContributors: VirtualContributorProps[];
  loading: boolean;
  showInviteOption?: boolean;
};

const VirtualContributorsBlock = ({
  virtualContributors,
  loading,
  showInviteOption = false,
}: VirtualContributorsBlockProps) => {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const closeInviteDialog = () => setInviteDialogOpen(false);

  const visibleVCs = virtualContributors.slice(0, VIRTUAL_CONTRIBUTORS_LIMIT);

  const onInvite = useCallback(() => {
    setInviteDialogOpen(true);
  }, [setInviteDialogOpen]);

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.contributors.virtualContributors.title')} icon={<VCIcon />} />
      {loading && <Loading />}
      <Gutters disablePadding>
        {showInviteOption && (
          <DashboardAddButton
            sx={{ padding: 0, textAlign: 'left' }}
            translationKey="community.invitations.inviteContributorsDialog.vcs.inviteBtn"
            onClick={onInvite}
          />
        )}
        {visibleVCs?.map(vc => (
          <BadgeCardView
            key={vc.profile.displayName}
            variant="rounded"
            visual={
              <Avatar
                src={vc.profile.avatar?.uri}
                alt={
                  vc.profile.displayName ? t('common.avatar-of', { user: vc.profile.displayName }) : t('common.avatar')
                }
              />
            }
            component={RouterLink}
            to={vc.profile.url}
          >
            <BlockSectionTitle>{vc.profile.displayName}</BlockSectionTitle>
          </BadgeCardView>
        ))}
      </Gutters>
      {virtualContributors.length > VIRTUAL_CONTRIBUTORS_LIMIT && (
        <SeeMore label="buttons.see-more" onClick={openDialog} />
      )}
      <VirtualContributorsDialog open={dialogOpen} onClose={closeDialog} virtualContributors={virtualContributors} />
      {inviteDialogOpen && (
        <InviteContributorsDialog
          open={inviteDialogOpen}
          onClose={closeInviteDialog}
          type={RoleSetContributorType.Virtual}
        />
      )}
    </PageContentBlock>
  );
};

export default VirtualContributorsBlock;
