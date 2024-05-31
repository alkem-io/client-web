import { FC } from 'react';
import BasicSpaceCard from '../../../../community/virtualContributor/components/BasicSpaceCard';
import { DeleteIcon } from '../SpaceSettings/icon/DeleteIcon';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { Button } from '@mui/material';

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
}

const ContributorOnAccountCard: FC<ContributorOnAccountCardProps> = ({ contributor, space }) => {
  const spaceData = {
    displayName: contributor?.profile.displayName ?? '',
    url: contributor?.profile.url ? contributor?.profile.url + '/settings/profile' : '',
    avatar: {
      uri: contributor?.profile.avatar?.uri ?? '',
    },
    tagline: space?.profile.displayName ?? '',
  };

  return (
    <>
      <Gutters display={'flex'} sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <BasicSpaceCard space={spaceData} />
        <Button variant="text" startIcon={<DeleteIcon />} />
      </Gutters>
    </>
  );
};

export default ContributorOnAccountCard;
