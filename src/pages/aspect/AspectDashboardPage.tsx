import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useUpdateNavigation, useUrlParams } from '../../hooks';
import { useResolvedPath } from 'react-router-dom';
import AspectDashboardView from '../../views/aspect/AspectDashboardView';
import AspectDashboardContainer from '../../containers/aspect/AspectDashboardContainer/AspectDashboardContainer';

export interface AspectDashboardPageProps extends PageProps {}

const AspectDashboardPage: FC<AspectDashboardPageProps> = ({ paths: _paths }) => {
  const { hubNameId = '', challengeNameId, opportunityNameId, aspectNameId = '' } = useUrlParams();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(() => [..._paths, { value: '', name: 'Dashboard', real: false }], [_paths, resolved]);
  useUpdateNavigation({ currentPaths });

  return (
    <AspectDashboardContainer
      hubNameId={hubNameId}
      aspectNameId={aspectNameId}
      challengeNameId={challengeNameId}
      opportunityNameId={opportunityNameId}
    >
      {({ aspect, messages, commentId, ...rest }) => (
        <AspectDashboardView
          banner={aspect?.banner?.uri}
          displayName={aspect?.displayName}
          description={aspect?.description}
          type={aspect?.type}
          tags={aspect?.tagset?.tags}
          references={aspect?.references}
          messages={messages}
          commentId={commentId}
          {...rest}
        />
      )}
    </AspectDashboardContainer>
  );
};
export default AspectDashboardPage;
