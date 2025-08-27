import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent, ListItemButton, ListItemButtonProps, ListItemButtonTypeMap } from '@mui/material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import Avatar from '@/core/ui/avatar/Avatar';
import RouterLink, { RouterLinkProps } from '@/core/ui/link/RouterLink';
import { BlockSectionTitle } from '@/core/ui/typography';
import { SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import SearchField from '@/core/ui/search/SearchField';
import VCIcon from '@/domain/community/virtualContributor/VirtualContributorsIcons';

export interface VirtualContributorProps {
  id: string;
  searchVisibility?: SearchVisibility;
  profile: {
    displayName: string;
    tagline?: string;
    avatar?: {
      uri: string;
    };
    url: string;
  };
}

type VirtualContributorsDialogProps = {
  open: boolean;
  onClose: () => void;
  virtualContributors: VirtualContributorProps[];
};

const VirtualContributorsDialog = ({ open, onClose, virtualContributors }: VirtualContributorsDialogProps) => {
  const { t } = useTranslation();

  const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>(
    props: ListItemButtonProps<D, P> & RouterLinkProps
  ) => <ListItemButton component={RouterLink} {...props} />;

  const [filter, setFilter] = useState<string>('');
  const filteredVCs = useMemo(
    () =>
      (virtualContributors.length > 0 && filter.length > 0
        ? virtualContributors.filter((virtualContributor: VirtualContributorProps) =>
            virtualContributor.profile.displayName.toLowerCase().includes(filter.toLowerCase())
          )
        : virtualContributors) ?? [],
    [virtualContributors, filter]
  );

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={6} aria-labelledby="virtual-contributors-dialog">
      <DialogHeader
        id="virtual-contributors-dialog"
        onClose={onClose}
        title={t('pages.contributors.virtualContributors.title')}
        icon={<VCIcon />}
      />
      <SearchField
        value={filter}
        onChange={event => setFilter(event.target.value)}
        placeholder={t('community.virtualContributors.searchVC')}
        sx={{ paddingLeft: 2, paddingRight: 2, marginTop: 2 }}
      />

      <DialogContent>
        <Gutters disablePadding>
          {filteredVCs.map(vc => (
            <BadgeCardView
              variant="rounded"
              visual={
                <Avatar
                  src={vc.profile.avatar?.uri}
                  alt={
                    vc.profile.displayName
                      ? t('common.avatar-of', { user: vc.profile.displayName })
                      : t('common.avatar')
                  }
                />
              }
              component={Wrapper}
              to={vc.profile.url}
              key={vc.id}
            >
              <BlockSectionTitle>{vc.profile.displayName}</BlockSectionTitle>
              <BlockSectionTitle>{vc.profile.tagline}</BlockSectionTitle>
            </BadgeCardView>
          ))}
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default VirtualContributorsDialog;
