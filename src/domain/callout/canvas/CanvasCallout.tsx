import CalloutLayout, { CalloutLayoutProps } from '../CalloutLayout';
import React, { useCallback, useState } from 'react';
import SimpleCard from '../../shared/components/SimpleCard';
import { WbIncandescentOutlined } from '@mui/icons-material';
import { LinkWithState } from '../../shared/types/LinkWithState';
import CardsLayout from '../../shared/layout/CardsLayout/CardsLayout';
import { OptionalCoreEntityIds } from '../../shared/types/CoreEntityIds';
import CanvasCreateDialog from '../../../components/composite/dialogs/CanvasDialog/CanvasCreateDialog';
import { CanvasProvider } from '../../../containers/canvas/CanvasProvider';
import CanvasActionsContainer from '../../../containers/canvas/CanvasActionsContainer';
import CreateCalloutItemButton from '../CreateCalloutItemButton';
import { useUpdateCalloutMutation } from '../../../hooks/generated/graphql';
import { CalloutVisibility } from '../../../models/graphql-schema';
import { useApolloErrorHandler } from '../../../hooks';

interface Canvas {
  id: string;
  nameID: string;
  displayName: string;
  preview?: {
    uri: string;
  };
}

interface CanvasCalloutProps extends OptionalCoreEntityIds {
  callout: CalloutLayoutProps['callout'] & {
    canvases: Canvas[];
  };
  buildCanvasUrl: (canvasId: string) => LinkWithState;
  loading?: boolean;
  canCreate?: boolean;
}

const CanvasCallout = ({
  callout,
  loading,
  hubNameId,
  challengeNameId,
  opportunityNameId,
  buildCanvasUrl,
  canCreate = false,
}: CanvasCalloutProps) => {
  const handleError = useApolloErrorHandler();

  const [showCreateCanvasDialog, setShowCreateCanvasDialog] = useState(false);
  const handleCreateDialogOpened = () => setShowCreateCanvasDialog(true);
  const handleCreateDialogClosed = () => setShowCreateCanvasDialog(false);

  const [updateCallout] = useUpdateCalloutMutation({ onError: handleError });
  const onVisibilityChanged = useCallback(
    (visibility: CalloutVisibility) => {
      updateCallout({
        variables: { calloutData: { ID: callout.id, visibility } },
      });
    },
    [
      /* visibility is not part of the callout */
    ]
  );

  return (
    <>
      <CalloutLayout callout={callout} maxHeight={18} onVisibilityChanged={onVisibilityChanged}>
        <CardsLayout
          items={loading ? [undefined, undefined] : callout.canvases}
          deps={[hubNameId, challengeNameId, opportunityNameId]}
          {...(canCreate
            ? {
                createButtonComponent: (
                  <CreateCalloutItemButton onClick={handleCreateDialogOpened}>
                    <SimpleCard to={''}></SimpleCard>
                  </CreateCalloutItemButton>
                ),
              }
            : {})}
        >
          {canvas => (
            <SimpleCard
              key={canvas!.id}
              {...buildCanvasUrl(canvas!.nameID)}
              title={canvas!.displayName}
              imageUrl={canvas!.preview?.uri}
              iconComponent={WbIncandescentOutlined}
            />
          )}
        </CardsLayout>
      </CalloutLayout>
      <CanvasProvider>
        {(entities, state) => (
          <CanvasActionsContainer>
            {(_, actionsState, actions) => (
              <CanvasCreateDialog
                entities={{
                  calloutID: callout.id,
                  templates: entities.templates,
                }}
                actions={{
                  onCancel: handleCreateDialogClosed,
                  onConfirm: input => {
                    actions.onCreate(input);
                    setShowCreateCanvasDialog(false);
                  },
                }}
                options={{
                  show: showCreateCanvasDialog,
                }}
                state={{
                  canvasLoading: state.loadingCanvases,
                  templatesLoading: state.loadingCanvases,
                }}
              />
            )}
          </CanvasActionsContainer>
        )}
      </CanvasProvider>
    </>
  );
};

export default CanvasCallout;
