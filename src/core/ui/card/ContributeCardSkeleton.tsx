import { Skeleton } from '@mui/material';
import { gutters } from '../grid/utils';
import CardHeader from './CardHeader';
import ContributeCard, { type ContributeCardProps } from './ContributeCard';

const ContributeCardSkeleton = (props: ContributeCardProps) => (
  <ContributeCard {...props}>
    <CardHeader title={<Skeleton />} />
    <Skeleton variant="rectangular" sx={{ height: gutters(8) }} />
    <Skeleton sx={{ margin: gutters() }} />
  </ContributeCard>
);

export default ContributeCardSkeleton;
