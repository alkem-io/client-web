import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListItemButton, ListItemButtonProps, ListItemButtonTypeMap } from '@mui/material';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import SeeMore from '@/core/ui/content/SeeMore';
import Loading from '@/core/ui/loading/Loading';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import Avatar from '@/core/ui/avatar/Avatar';
import { BlockSectionTitle } from '@/core/ui/typography';
import RouterLink, { RouterLinkProps } from '@/core/ui/link/RouterLink';
import VirtualContributorsDialog, { VirtualContributorProps } from './VirtualContributorsDialog';
import VCIcon from '@/domain/community/virtualContributor/VirtualContributorsIcons';

export const VIRTUAL_CONTRIBUTORS_LIMIT = 3;

type VirtualContributorsBlockProps = {
  virtualContributors: VirtualContributorProps[];
  loading: boolean;
};

const VirtualContributorsBlock = ({ virtualContributors, loading }: VirtualContributorsBlockProps) => {
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  const visibleVCs = virtualContributors.slice(0, VIRTUAL_CONTRIBUTORS_LIMIT);

  const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>(
    props: ListItemButtonProps<D, P> & RouterLinkProps
  ) => <ListItemButton component={RouterLink} {...props} />;

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('pages.admin.virtualContributors.title')} icon={<VCIcon />} />
      {loading && <Loading />}
      {visibleVCs?.map(vc => (
        <BadgeCardView
          variant="rounded"
          visual={<Avatar src={vc.profile.avatar?.uri} alt={t('common.avatar-of', { user: vc.profile.displayName })} />}
          component={Wrapper}
          to={vc.profile.url}
        >
          <BlockSectionTitle>{vc.profile.displayName}</BlockSectionTitle>
        </BadgeCardView>
      ))}
      {virtualContributors.length > VIRTUAL_CONTRIBUTORS_LIMIT && (
        <SeeMore label="buttons.see-more" onClick={openDialog} />
      )}
      <VirtualContributorsDialog open={dialogOpen} onClose={closeDialog} virtualContributors={virtualContributors} />
    </PageContentBlock>
  );
};

export default VirtualContributorsBlock;
