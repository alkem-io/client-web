import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import EditVisualsView from '../../../views/Visuals/EditVisualsView';
import { useChallenge, useUpdateNavigation } from '../../../hooks';

export interface ChallengeVisualsPageProps extends PageProps {}

const ChallengeVisualsPage: FC<ChallengeVisualsPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'visuals', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const { challenge } = useChallenge();

  return <EditVisualsView visuals={challenge?.context?.visuals} />;
};
export default ChallengeVisualsPage;
