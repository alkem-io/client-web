import { Skeleton } from '@mui/material';
import React from 'react';
import ContributeCard, { CONTRIBUTE_CARD_COLUMNS } from './ContributeCard';
import CardHeader from './CardHeader';
import CardFooter from './CardFooter';
import useCurrentBreakpoint from '../utils/useCurrentBreakpoint';
import { gutters } from '../grid/utils';

const ContributeCardSkeleton = () => {
  const breakpoint = useCurrentBreakpoint();

  return (
    <ContributeCard columns={breakpoint === 'xs' ? 2 : CONTRIBUTE_CARD_COLUMNS}>
      <CardHeader title={<Skeleton />} />
      <Skeleton variant="rectangular" sx={{ height: gutters(5) }} />
      <CardFooter flexDirection="column" alignItems="stretch" height="auto">
        <Skeleton sx={{ marginY: gutters() }} />
      </CardFooter>
    </ContributeCard>
  );
};

export default ContributeCardSkeleton;
