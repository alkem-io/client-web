import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import EditVisualsView from '../../../views/Visuals/EditVisualsView';
import { useChallenge, useUpdateNavigation } from '../../../hooks';
import { Box } from '@mui/material';

export interface ChallengeVisualsPageProps extends PageProps {}

const ChallengeVisualsPage: FC<ChallengeVisualsPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'visuals', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const { challenge } = useChallenge();

  return (
    <Box paddingY={2}>
      <EditVisualsView visuals={challenge?.context?.visuals} />
    </Box>
  );
};
export default ChallengeVisualsPage;
