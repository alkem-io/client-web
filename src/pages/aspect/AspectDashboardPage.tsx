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
      {(entities, state, actions) => (
        <AspectDashboardView
          entities={{
            banner: entities.aspect?.banner?.uri,
            displayName: entities.aspect?.displayName,
            description: entities.aspect?.defaultDescription,
            type: entities.aspect?.type,
            tags: entities.aspect?.tagset?.tags,
            references: entities.aspect?.references,
            messages: entities.messages,
            commentId: entities.commentId,
          }}
          state={{
            loading: state.loading,
            error: state.error,
          }}
          actions={{
            handlePostComment: actions.handlePostComment,
            handleDeleteComment: actions.handleDeleteComment,
          }}
          options={{
            canReadComments: entities.permissions.canReadComments,
            canPostComments: entities.permissions.canPostComments,
            canDeleteComments: entities.permissions.canDeleteComments,
          }}
        />
      )}
    </AspectDashboardContainer>
  );
};
export default AspectDashboardPage;
