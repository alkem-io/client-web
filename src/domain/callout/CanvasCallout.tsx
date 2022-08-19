import CalloutLayout, { CalloutLayoutProps } from './CalloutLayout';
import React, { useState } from 'react';
import SimpleCard, { SIMPLE_CARD_WIDTH } from '../shared/components/SimpleCard';
import { WbIncandescentOutlined } from '@mui/icons-material';
import { LinkWithState } from '../shared/types/LinkWithState';
import CardsLayout from '../shared/layout/CardsLayout/CardsLayout';
import { OptionalCoreEntityIds } from '../shared/types/CoreEntityIds';
import CanvasCreateDialog from '../../components/composite/dialogs/CanvasDialog/CanvasCreateDialog';
import { CanvasProvider } from '../../containers/canvas/CanvasProvider';
import CanvasActionsContainer from '../../containers/canvas/CanvasActionsContainer';

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
  showCreateButton?: boolean;
}

const CanvasCallout = ({
  callout,
  loading,
  showCreateButton,
  hubNameId,
  challengeNameId,
  opportunityNameId,
  buildCanvasUrl,
}: CanvasCalloutProps) => {
  const [showCreateCanvasDialog, setShowCreateCanvasDialog] = useState(false);
  const handleCreateDialogOpened = () => setShowCreateCanvasDialog(true);
  const handleCreateDialogClosed = () => setShowCreateCanvasDialog(false);

  return (
    <>
      <CalloutLayout callout={callout} maxHeight={18}>
        <CardsLayout
          items={loading ? [undefined, undefined] : callout.canvases}
          deps={[hubNameId, challengeNameId, opportunityNameId]}
          showCreateButton={showCreateButton}
          onCreateButtonClick={handleCreateDialogOpened}
          createButtonWidth={SIMPLE_CARD_WIDTH}
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
