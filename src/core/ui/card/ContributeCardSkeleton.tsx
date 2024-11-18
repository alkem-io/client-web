import { Skeleton } from '@mui/material';
import ContributeCard, { ContributeCardProps } from './ContributeCard';
import CardHeader from './CardHeader';
import { gutters } from '../grid/utils';

const ContributeCardSkeleton = (props: ContributeCardProps) => {
  return (
    <ContributeCard {...props}>
      <CardHeader title={<Skeleton />} />
      <Skeleton variant="rectangular" sx={{ height: gutters(8) }} />
      <Skeleton sx={{ margin: gutters() }} />
    </ContributeCard>
  );
};

export default ContributeCardSkeleton;
