import React, { PropsWithChildren } from 'react';
import ContributeCard from '../../../core/ui/card/ContributeCard';
import { AddCircleOutline } from '@mui/icons-material';

interface CreateCalloutItemButtonProps {
  onClick: () => void;
}

const CreateCalloutItemButton = ({ onClick }: PropsWithChildren<CreateCalloutItemButtonProps>) => {
  return (
    <ContributeCard
      onClick={onClick}
      sx={{ alignSelf: 'stretch', fontSize: theme => theme.spacing(5), justifyContent: 'center', alignItems: 'center' }}
    >
      <AddCircleOutline fontSize="inherit" color="primary" />
    </ContributeCard>
  );
};

export default CreateCalloutItemButton;
