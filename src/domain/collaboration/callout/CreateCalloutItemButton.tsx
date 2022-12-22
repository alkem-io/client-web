import React, { PropsWithChildren } from 'react';
import ContributeCard from '../../../core/ui/card/ContributeCard';
import { AddCircleOutline } from '@mui/icons-material';
import { gutters } from '../../../core/ui/grid/utils';

interface CreateCalloutItemButtonProps {
  onClick: () => void;
}

const CreateCalloutItemButton = ({ onClick }: PropsWithChildren<CreateCalloutItemButtonProps>) => {
  return (
    <ContributeCard
      onClick={onClick}
      sx={{
        alignSelf: 'stretch',
        fontSize: theme => theme.spacing(5),
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: gutters(12),
      }}
    >
      <AddCircleOutline fontSize="inherit" color="primary" />
    </ContributeCard>
  );
};

export default CreateCalloutItemButton;
