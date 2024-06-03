import { FC } from 'react';
import IconButton from '@mui/material/IconButton';
import BasicSpaceCard from '../../../../community/virtualContributor/components/BasicSpaceCard';
import { DeleteIcon } from '../SpaceSettings/icon/DeleteIcon';
import Gutters from '../../../../../core/ui/grid/Gutters';

interface ContributorOnAccountCardProps {
  contributor?: {
    profile: {
      displayName: string;
      url: string;
      avatar?: {
        uri: string;
      };
    };
  };
  space?: {
    profile: {
      displayName: string;
      avatar?: {
        uri: string;
      };
    };
  };
  hasDelete?: boolean;
  onDeleteClick: () => void;
}

const ContributorOnAccountCard: FC<ContributorOnAccountCardProps> = ({
  contributor,
  space,
  hasDelete = false,
  onDeleteClick,
}) => {
  const spaceData = {
    displayName: contributor?.profile.displayName ?? '',
    url: contributor?.profile.url ? contributor?.profile.url : '',
    avatar: {
      uri: contributor?.profile.avatar?.uri ?? '',
    },
    tagline: space?.profile.displayName ?? '',
  };

  return (
    <Gutters
      display={'flex'}
      sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
    >
      <BasicSpaceCard space={spaceData} />
      {hasDelete && (
        <IconButton onClick={onDeleteClick}>
          <DeleteIcon />
        </IconButton>
      )}
    </Gutters>
  );
};

export default ContributorOnAccountCard;
