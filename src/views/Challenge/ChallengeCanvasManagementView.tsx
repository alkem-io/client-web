import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CanvasActionsContainer from '../../containers/canvas/CanvasActionsContainer';
import { CanvasProvider } from '../../containers/canvas/CanvasProvider';
import { useConfig } from '../../hooks';
import { FEATURE_COLLABORATION_CANVASES } from '../../models/constants';
import { AuthorizationPrivilege, ChallengeProfileFragment } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import { Error404 } from '../../pages';
import CanvasManagementView from '../Canvas/CanvasManagementView';

export interface ChallengeContextViewEntities {
  challenge: ChallengeProfileFragment;
}

export interface ChallengeContextViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengeCanvasManagementViewProps
  extends ViewProps<ChallengeContextViewEntities, undefined, ChallengeContextViewState, undefined> {}

const ChallengeCanvasManagementView: FC<ChallengeCanvasManagementViewProps> = ({ entities, state }) => {
  const { challenge } = entities;
  const contextID = challenge.context?.id || '';

  const { t } = useTranslation();

  const { isFeatureEnabled } = useConfig();

  const hasReadPriviliges =
    challenge.context?.authorization?.anonymousReadAccess ||
    challenge.context?.authorization?.myPrivileges?.some(p => p === AuthorizationPrivilege.Read);

  if (!isFeatureEnabled(FEATURE_COLLABORATION_CANVASES) || !hasReadPriviliges) return <Error404 />;

  const hasCreatePriviliges = challenge.context?.authorization?.myPrivileges?.some(
    p => p === AuthorizationPrivilege.CreateCanvas
  );
  const hasDeletePriviliges = challenge.context?.authorization?.myPrivileges?.some(
    p => p === AuthorizationPrivilege.Delete
  );
  // Todo: need to decide who can edit what canvases, for now tie to CreateCanvas. May need to extend the information on a Canvas
  // to include who created it etc.
  const hasUpdatePriviliges = challenge.context?.authorization?.myPrivileges?.some(
    p => p === AuthorizationPrivilege.CreateCanvas
  );

  return (
    <CanvasProvider>
      {(canvasEntities, canvasState) => (
        <CanvasActionsContainer>
          {(_, actionsState, actions) => (
            <CanvasManagementView
              entities={{
                ...canvasEntities,
                contextID,
                contextSource: 'challenge',
                templateListHeader: t('pages.canvas.challenge.templatesHeader'),
                templateListSubheader: t('pages.canvas.challenge.templatesHeader'),
              }}
              actions={actions}
              state={{
                ...canvasState,
                ...actionsState,
                loadingCanvases: state.loading,
              }}
              options={{
                canUpdate: hasUpdatePriviliges,
                canCreate: hasCreatePriviliges,
                canDelete: hasDeletePriviliges,
              }}
            />
          )}
        </CanvasActionsContainer>
      )}
    </CanvasProvider>
  );
};

export default ChallengeCanvasManagementView;
