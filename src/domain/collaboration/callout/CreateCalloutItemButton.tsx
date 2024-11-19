import { PropsWithChildren } from 'react';
import ContributeCard from '@/core/ui/card/ContributeCard';
import { AddCircleOutline } from '@mui/icons-material';
import { gutters } from '@/core/ui/grid/utils';

const CreateCalloutItemButton = ({ onClick }: PropsWithChildren<{ onClick: () => void }>) => (
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

export default CreateCalloutItemButton;
