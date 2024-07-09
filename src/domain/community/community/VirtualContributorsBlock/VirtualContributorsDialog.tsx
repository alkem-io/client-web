import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent, ListItemButton, ListItemButtonProps, ListItemButtonTypeMap } from '@mui/material';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import Gutters from '../../../../core/ui/grid/Gutters';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import Avatar from '../../../../core/ui/avatar/Avatar';
import RouterLink, { RouterLinkProps } from '../../../../core/ui/link/RouterLink';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { SearchVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { ReactComponent as VirtualContributorIcon } from '../../../../domain/community/virtualContributor/virtualContributor.svg';
import SearchField from '../../../../core/ui/search/SearchField';

export interface VirtualContributorProps {
  id: string;
  nameID?: string;
  searchVisibility: SearchVisibility;
  profile: {
    displayName: string;
    tagline: string;
    avatar?: {
      uri: string;
    };
    url: string;
  };
}

interface VirtualContributorsDialogProps {
  open: boolean;
  onClose: () => void;
  virtualContributors: VirtualContributorProps[];
}

const VirtualContributorsDialog: FC<VirtualContributorsDialogProps> = ({ open, onClose, virtualContributors }) => {
  const { t } = useTranslation();

  const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>(
    props: ListItemButtonProps<D, P> & RouterLinkProps
  ) => <ListItemButton component={RouterLink} {...props} />;

  const [filter, setFilter] = useState<string>('');
  const filterVCs = (virtualContributor: VirtualContributorProps) => {
    const lowerCaseFilter = filter.toLowerCase();

    return (
      virtualContributor.profile.displayName.toLowerCase().includes(lowerCaseFilter) ||
      virtualContributor.nameID?.toLowerCase().includes(lowerCaseFilter) ||
      virtualContributor.profile.tagline.toLowerCase().includes(lowerCaseFilter)
    );
  };
  const filteredVCs = useMemo(
    () =>
      (virtualContributors && filter.length > 0 ? virtualContributors.filter(filterVCs) : virtualContributors) ?? [],
    [virtualContributors, filter]
  );

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={6}>
      <DialogHeader
        onClose={onClose}
        title={t('pages.admin.virtualContributors.title')}
        icon={<VirtualContributorIcon />}
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
                <Avatar src={vc.profile.avatar?.uri} alt={t('common.avatar-of', { user: vc.profile.displayName })} />
              }
              component={Wrapper}
              to={vc.profile.url}
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
