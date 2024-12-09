import { useState } from 'react';
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
import { noop } from 'lodash';

export const VIRTUAL_CONTRIBUTORS_LIMIT = 3;

type VirtualContributorsBlockProps = {
  virtualContributors: VirtualContributorProps[];
  loading: boolean;
  showInviteOption?: boolean;
  onInviteClick?: () => void;
};

const VirtualContributorsBlock = ({
  virtualContributors,
  loading,
  showInviteOption = false,
  onInviteClick = noop,
}: VirtualContributorsBlockProps) => {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  const visibleVCs = virtualContributors.slice(0, VIRTUAL_CONTRIBUTORS_LIMIT);

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.contributors.virtualContributors.title')} icon={<VCIcon />} />
      {loading && <Loading />}
      <Gutters disablePadding>
        {showInviteOption && (
          <DashboardAddButton
            sx={{ padding: 0, textAlign: 'left' }}
            translationKey="community.virtualContributors.inviteBtn"
            onClick={onInviteClick}
          />
        )}
        {visibleVCs?.map(vc => (
          <BadgeCardView
            key={vc.profile.displayName}
            variant="rounded"
            visual={
              <Avatar src={vc.profile.avatar?.uri} alt={t('common.avatar-of', { user: vc.profile.displayName })} />
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
    </PageContentBlock>
  );
};

export default VirtualContributorsBlock;
