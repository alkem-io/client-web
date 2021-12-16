import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CanvasActionsContainer from '../../containers/canvas/CanvasActionsContainer';
import { CanvasProvider } from '../../containers/canvas/CanvasProvider';
import { useConfig } from '../../hooks';
import { FEATURE_COLLABORATION_CANVASES } from '../../models/constants';
import { ChallengeProfileFragment } from '../../models/graphql-schema';
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

  if (!isFeatureEnabled(FEATURE_COLLABORATION_CANVASES)) return <Error404 />;

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
                isEditable: true,
              }}
            />
          )}
        </CanvasActionsContainer>
      )}
    </CanvasProvider>
  );
};

export default ChallengeCanvasManagementView;
